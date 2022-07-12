{
    init: function(elevators, floors) {
        getMaxFloorQueued = (elevator) => {
            var maxFloor = 0;
            elevator.destinationQueue.forEach(floorNum => {
                if(floorNum > maxFloor) {
                    maxFloor = floorNum;
                }
            });
        }
        getMinFloorQueued = (elevator) => {
            var minFloor = 100;
            elevator.destinationQueue.forEach(floorNum => {
                if(floorNum < minFloor) {
                    minFloor = floorNum;
                }
            });
        }

        elevators.forEach(elevator => {
            elevator.on("idle", function() {
                // let's go to all the floors (or did we forget one?)
                elevator.goToFloor(3);
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                if (floorNum > elevator.currentFloor()) {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                } else {
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                }
                elevator.goToFloor(floorNum);
            });
    
            elevator.on("passing_floor", function(floorNum, direction) {
                var floor = floors[floorNum];
                if ((elevator.goingUpIndicator() && floor.buttonStates.up === "activated") || 
                    ((elevator.goingDownIndicator() && floor.buttonStates.down === "activated")
                    && elevator.loadFactor() < .75) ||
                    (elevator.getPressedFloors().includes(floorNum))) {
                    for(var i = 0; i <  elevator.destinationQueue.length; i++){ 
                        if (elevator.destinationQueue[i] === floorNum) { 
                            elevator.destinationQueue.splice(i, 1);
                            i--;
                            elevator.checkDestinationQueue();
                        }
                    }
                    elevator.goToFloor(floorNum, true);
                }

                elevator.destinationQueue.forEach(destinationFloor => {
                    if (elevator.loadFactor() >= .75 && !elevator.getPressedFloors().includes(destinationFloor)) {
                        for(var i = 0; i <  elevator.destinationQueue.length; i++){ 
                            if (elevator.destinationQueue[i] === floor) { 
                                elevator.destinationQueue.splice(i, 1); 
                                i--;
                                elevator.checkDestinationQueue();
                            }
                        }
                    }
                });

                if (elevator.destinationDirection() === "up") {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                } else if (elevator.destinationDirection() === "down") {
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                } else {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(true);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                var maxFloor = floors[floors.length-1].floorNum();
                if (elevator.destinationQueue[0] != null) {
                    if (elevator.destinationQueue[0] > floorNum || floorNum === 0) {
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                    } else if (elevator.destinationQueue[0] < floorNum || floorNum === maxFloor) {
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                    }
                } else {
                    if (floorNum === 0) {
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                    } else if (floorNum === maxFloor) {
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                    } else {
                        if(floors[floorNum].buttonStates.up == "activated") {
                            elevator.goingUpIndicator(true);
                            elevator.goingDownIndicator(false);
                        } else {
                            elevator.goingUpIndicator(false);
                            elevator.goingDownIndicator(true);
                        }
                    }
                }
            });
        });

        floors.forEach(floor => {
            floor.on("up_button_pressed", function() {
                var bestElevator = elevators[0];
                var bestLoadFactor = 2;
                elevators.every(elevator => {
                    if(elevator.currentFloor() <= floor.floorNum() && elevator.destinationDirection() === "up") {
                        if (elevator.loadFactor() < 1 && elevator.loadFactor() < bestLoadFactor) {
                            bestElevator = elevator;    
                            bestLoadFactor = elevator.loadFactor();
                            return false;
                        }
                    }
                    if(elevator.destinationQueue.length == 0  || elevator.loadFactor() == 0) {
                        if(elevator.destinationQueue)
                        bestElevator = elevator;
                        bestLoadFactor = elevator.loadFactor();
                    }
                    return true;
                });
                if(bestElevator.loadFactor() == 0 && getMaxFloorQueued(bestElevator) < floor.floorNum()) {
                    bestElevator.stop();
                    bestElevator.goToFloor(floor.floorNum(), true);
                } else {
                    bestElevator.goToFloor(floor.floorNum());
                }            
            });

            floor.on("down_button_pressed", function() {
                var bestElevator = elevators[0];
                var bestLoadFactor = 2;
                elevators.every(elevator => {
                    if(elevator.currentFloor() >= floor.floorNum() && elevator.destinationDirection() === "down") {
                        if (elevator.loadFactor() < 1 && elevator.loadFactor() < bestLoadFactor) {
                            bestElevator = elevator;
                            bestLoadFactor = elevator.loadFactor();
                            return false;
                        }
                    }
                    if(elevator.destinationQueue.length == 0) {
                        bestElevator = elevator;
                        bestLoadFactor = elevator.loadFactor();
                    }
                    return true;
                });

                if(bestElevator.loadFactor() == 0 && getMinFloorQueued(bestElevator) > floor.floorNum()) {
                    bestElevator.stop();
                    bestElevator.goToFloor(floor.floorNum(), true);
                } else {
                    bestElevator.goToFloor(floor.floorNum());
                }
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}