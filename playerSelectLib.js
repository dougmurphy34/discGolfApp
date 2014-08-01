	//populate players dropdown
	var playerArray;//names and score history of all players in system, stored in localStorage "players"
	var currentPlayers = new Array;//names and current game scores of players playing right now, stored in localStorage "currentGame"
	
	function loadPlayers() {
	if (localStorage.getItem("players") != null) {
		playerArray = JSON.parse(localStorage.getItem("players"));
			
		document.getElementById("firstButton").innerText = playerArray.length + " players to choose from";
		$("option").remove();
		
		for (var i=0; i<playerArray.length; i++) {
		
			var selector = document.getElementById("playerselector");
			var option = document.createElement('option');
			option.innerText = playerArray[i].Username;
			option.value = playerArray[i].Username;
			selector.appendChild(option);
			//THESE DIDN"T WORK   selector.focus();selector.blur();
			//Need to check and uncheck a box in here to force a refresh, just like I've been doing manually.  Or, blur/focus the actual span with the checkbox?
		}
		
		
	}
	else {
		//RIGHT NOW: This prepopulates with user "Doug".  Eventually, make sure I can handle no players in the system.
		//*******Actually, Does not work the first time you try because of the bug with putting new players in the player select box.
		//alert("We should only be here if there's no data in localStorage");
		document.getElementById("firstButton").innerText = "Enter Players";
		var tempPlayerData = [{"Username":"Doug", "Scores":[]}]
		localStorage.setItem("players",JSON.stringify(tempPlayerData));
	}
	
	//call a refresh on the playerselector object
	
	}

function getPb(passedUsername) {
	playerArray = JSON.parse(localStorage.getItem("players"));
	var currScores;//array containing the passed user's scores
	
	playerArray.forEach(function(currUser) {
		if (passedUsername == currUser.Username) {
			currScores = currUser.Scores;
		}
	})
	
	var pb=99;
	for (i=0; i<currScores.length; i++) {
		if (currScores[i] < pb) { pb = currScores[i] }
	}
	
	return pb;
	
}

function getAvg(passedUsername) {
	playerArray = JSON.parse(localStorage.getItem("players"));
	var currScores;//array containing the passed user's scores
	
	playerArray.forEach(function(currUser) {
		if (passedUsername == currUser.Username) {
			currScores = currUser.Scores;
		}
	})
	
	var sum = 0;
	for (i=0; i< currScores.length; i++) {
		sum += currScores[i]
	}
	
	if (currScores.length > 0) {//prevent division by zero
		var avg = sum/currScores.length;
	}
	else {
		var avg = 99;
	}
	return avg;
}	
	
function updatePlayerData(currPlayerArray) {
	
	//this should only be called at the end of a game, to input the final scores into a player's permanent record
	var permDataArray = JSON.parse(localStorage.getItem("players"));
	
	currPlayerArray.forEach(function(thisCurrPlayer) {
		permDataArray.forEach(function(thisPermPlayer) {
			if (thisPermPlayer.Username == thisCurrPlayer.Username) {
				//loop on current scores and sum
				var total = 0;
				thisCurrPlayer.Scores.forEach(function(thisHoleScore){
					total += thisHoleScore;
				})
				//then push to perm Scores array
				thisPermPlayer.Scores.push(total);
								
			}
		})
	})
	
	//store the data permanently
	localStorage.setItem("players",JSON.stringify(permDataArray));
	
}

function addPlayers(inputName) {
	//load selection to list of active players
	currentPlayers.push({"Username":inputName, "Scores":[]});
}
