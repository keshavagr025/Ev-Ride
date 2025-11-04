// socket.js
const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if(userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { 
                    socketId: socket.id,
                    isOnline: true
                });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { 
                    socketId: socket.id,
                    isOnline: true,
                    isAvailable: true
                });
            }
        });

        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            if(!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data'});
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            });
        });

        // NEW: Request ride - sent by user
        socket.on('request-ride', async (data) => {
            try {
                const { 
                    userId, 
                    pickup, 
                    destination, 
                    vehicleType, 
                    pickupCoords,
                    destinationCoords,
                    fare 
                } = data;

                console.log('Ride request received:', data);

                // Find nearby available captains
                const nearbyDrivers = await findNearbyCaptains(
                    pickupCoords.ltd,
                    pickupCoords.lng,
                    vehicleType,
                    5 // 5km radius
                );

                console.log(`Found ${nearbyDrivers.length} nearby drivers`);

                // Send nearby drivers count to user
                socket.emit('nearby-drivers', {
                    count: nearbyDrivers.length,
                    drivers: nearbyDrivers
                });

                // Send ride request to all nearby drivers
                const rideRequest = {
                    rideId: `ride_${Date.now()}_${userId}`,
                    userId,
                    pickup,
                    destination,
                    pickupCoords,
                    destinationCoords,
                    vehicleType,
                    fare,
                    userSocketId: socket.id,
                    timestamp: Date.now()
                };

                nearbyDrivers.forEach(driver => {
                    if(driver.socketId) {
                        io.to(driver.socketId).emit('new-ride-request', rideRequest);
                    }
                });

                // Set timeout for no drivers
                setTimeout(() => {
                    socket.emit('check-ride-status', { rideId: rideRequest.rideId });
                }, 30000); // 30 seconds

            } catch (error) {
                console.error('Error in request-ride:', error);
                socket.emit('error', { message: 'Failed to request ride' });
            }
        });

        // NEW: Captain accepts ride
        socket.on('accept-ride', async (data) => {
            try {
                const { rideId, captainId, userSocketId } = data;

                console.log(`Captain ${captainId} accepted ride ${rideId}`);

                // Get captain details
                const captain = await captainModel.findById(captainId);

                if(!captain) {
                    return socket.emit('error', { message: 'Captain not found' });
                }

                // Update captain availability
                await captainModel.findByIdAndUpdate(captainId, {
                    isAvailable: false,
                    currentRide: rideId
                });

                // Notify user that driver accepted
                io.to(userSocketId).emit('driver-accepted', {
                    rideId,
                    driver: {
                        id: captain._id,
                        name: captain.fullname.firstname + ' ' + captain.fullname.lastname,
                        phone: captain.phone,
                        vehicle: {
                            type: captain.vehicle.vehicleType,
                            plate: captain.vehicle.plate,
                            color: captain.vehicle.color,
                            capacity: captain.vehicle.capacity
                        },
                        location: captain.location,
                        socketId: captain.socketId
                    }
                });

                // Notify captain that acceptance was successful
                socket.emit('ride-accepted-confirmation', {
                    rideId,
                    message: 'Ride accepted successfully'
                });

                // Notify other captains that ride is taken
                const otherCaptains = await captainModel.find({
                    _id: { $ne: captainId },
                    isOnline: true,
                    isAvailable: true
                });

                otherCaptains.forEach(otherCaptain => {
                    if(otherCaptain.socketId) {
                        io.to(otherCaptain.socketId).emit('ride-taken', { rideId });
                    }
                });

            } catch (error) {
                console.error('Error in accept-ride:', error);
                socket.emit('error', { message: 'Failed to accept ride' });
            }
        });

        // NEW: Captain rejects ride
        socket.on('reject-ride', async (data) => {
            const { rideId, captainId } = data;
            console.log(`Captain ${captainId} rejected ride ${rideId}`);
            
            socket.emit('ride-rejected-confirmation', {
                rideId,
                message: 'Ride rejected'
            });
        });

        // NEW: User cancels ride request
        socket.on('cancel-ride-request', async (data) => {
            try {
                const { rideId, userId } = data;
                console.log(`User ${userId} cancelled ride ${rideId}`);

                // Notify all captains that ride is cancelled
                const captains = await captainModel.find({
                    isOnline: true,
                    isAvailable: true
                });

                captains.forEach(captain => {
                    if(captain.socketId) {
                        io.to(captain.socketId).emit('ride-cancelled', { rideId });
                    }
                });

                socket.emit('ride-cancelled-confirmation', {
                    rideId,
                    message: 'Ride cancelled successfully'
                });

            } catch (error) {
                console.error('Error in cancel-ride-request:', error);
                socket.emit('error', { message: 'Failed to cancel ride' });
            }
        });

        // NEW: Update captain availability
        socket.on('update-availability', async (data) => {
            const { captainId, isAvailable } = data;
            await captainModel.findByIdAndUpdate(captainId, { isAvailable });
            console.log(`Captain ${captainId} availability: ${isAvailable}`);
        });

        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
            
            // Update user/captain status to offline
            await userModel.findOneAndUpdate(
                { socketId: socket.id },
                { isOnline: false, socketId: null }
            );
            
            await captainModel.findOneAndUpdate(
                { socketId: socket.id },
                { isOnline: false, isAvailable: false, socketId: null }
            );
        });
    });
}

// Helper function to find nearby captains
async function findNearbyCaptains(userLat, userLng, vehicleType, radiusKm = 5) {
    try {
        // Get all online and available captains with matching vehicle type
        const captains = await captainModel.find({
            isOnline: true,
            isAvailable: true,
            'vehicle.vehicleType': vehicleType
        });

        // Filter by distance
        const nearbyCaptains = captains.filter(captain => {
            if(!captain.location || !captain.location.ltd || !captain.location.lng) {
                return false;
            }

            const distance = calculateDistance(
                userLat,
                userLng,
                captain.location.ltd,
                captain.location.lng
            );

            return distance <= radiusKm;
        }).map(captain => ({
            id: captain._id,
            name: captain.fullname.firstname + ' ' + captain.fullname.lastname,
            phone: captain.phone,
            vehicle: captain.vehicle,
            location: captain.location,
            socketId: captain.socketId,
            distance: calculateDistance(
                userLat,
                userLng,
                captain.location.ltd,
                captain.location.lng
            )
        }));

        // Sort by distance
        return nearbyCaptains.sort((a, b) => a.distance - b.distance);

    } catch (error) {
        console.error('Error finding nearby captains:', error);
        return [];
    }
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

const sendMessageToSocketId = (socketId, messageObject) => {
    console.log(messageObject);

    if(io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('socket.io not initialized');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };