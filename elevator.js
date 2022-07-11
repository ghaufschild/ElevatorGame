{
    init: function(elevators, floors) {
        elevators.forEach(elevator => {
            elevator.on("idle", function() {
                // let's go to all the floors (or did we forget one?)
                elevator.goingUpIndicator(false);
                elevator.goingDownIndicator(true);
                elevator.goToFloor(0);
            });
            
            elevator.on("floor_button_pressed", function(floorNum) {
                if (floorNum < elevator.currentFloor()) {
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
                    && elevator.loadFactor() < 1) ||
                    (elevator.getPressedFloors().includes(floorNum))) {
                    for(var i = 0; i <  elevator.destinationQueue.length; i++){ 
                        if (elevator.destinationQueue[i] === floorNum) { 
                            elevator.destinationQueue.splice(i, 1); 
                        }
                    }
                    elevator.checkDestinationQueue();
                    elevator.goToFloor(floorNum, true);
                }

                elevator.destinationQueue.forEach(destinationFloor => {
                    if (!elevator.getPressedFloors().includes(destinationFloor)) {
                        for(var i = 0; i <  elevator.destinationQueue.length; i++){ 
                            if (elevator.destinationQueue[i] === floor) { 
                                elevator.destinationQueue.splice(i, 1); 
                            }
                        }
                    }
                    elevator.checkDestinationQueue();
                })
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
                    if(elevator.currentFloor() < floor.floorNum() && elevator.destinationDirection() === "up") {
                        if (elevator.loadFactor() < 1 && elevator.loadFactor() < bestLoadFactor) {
                            bestElevator = elevator;
                            bestLoadFactor = elevator.loadFactor();
                            elevator.goToFloor(floor.floorNum());
                            return false;
                        }
                    }
                    if(elevator.destinationQueue.length == 0) {
                        bestElevator = elevator;
                        bestLoadFactor = elevator.loadFactor();
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                    }
                    return true;
                });
                bestElevator.goToFloor(floor.floorNum());
            });

            floor.on("down_button_pressed", function() {
                var bestElevator = elevators[0];
                var bestLoadFactor = 2;
                elevators.every(elevator => {
                    if(elevator.currentFloor() > floor.floorNum() && elevator.destinationDirection() === "down") {
                        if (elevator.loadFactor() < 1 && elevator.loadFactor() < bestLoadFactor) {
                            bestElevator = elevator;
                            bestLoadFactor = elevator.loadFactor();
                            elevator.goToFloor(floor.floorNum());
                            return false;
                        }
                    }
                    if(elevator.destinationQueue.length == 0) {
                        bestElevator = elevator;
                        bestLoadFactor = elevator.loadFactor();
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                    }
                    return true;
                });
                bestElevator.goToFloor(floor.floorNum());
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }


    //When an elevator has no where to go
    //Go to first floor

    //Go to floor that is lower and then higher floors pressed

    //When elevator is going in a direction
    //If button of same direction is pressed stop at that floor

}