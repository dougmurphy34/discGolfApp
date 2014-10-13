/*
DATA STRUCTURE FOR USER MANAGEMENT IN MORLEY FIELD APP

playerArray = [{username: name, scores:[score1,score2,scoreX]}], where score 1-X are full 19-hole totals of completed games
Store in "players" in localStorage.

currentPlayers = [{Username: name, Scores: [score1,score2,scoreX]}], where score 1-X are each hole score of current game
Store in "currentGame" in localStorage

Populate dropdown by looping on players through players.length and selecting usernames.  
Build currentPlayers array (in memory) by pushing players[X] to currentPlayers
Get PB by looping on players until username=(thisuser) is found, then loop on scores and find lowest.  Store in memory.

*/

/*TODO future functionality
	1) SKIP - Display app version onscreen. - see http://think2loud.com/224-reading-xml-with-jquery/
	2) Put a data summary screen that shows all players, their games played, PBs and averages
	3) delete players from memory
	4) Record full detail of rounds, changing data type to remember score on each hole.
	5) Force reorient on long scorecard; switch back on return.
	6) "Done" button for player select.
	7) Roll my own theme here: http://themeroller.jquerymobile.com/
*/

/*
TODO: Minor bug fixes
    1) fix endgame not working on Android, works on iOS
		--shows the wrong score on iOS (was 0/+1, showed 0/0) (0.0.7, live 19 holes); One test today (0.0.8) seemed to work on iPhone
		-- Android FIX FAILED with window.location.hash.
	2) Names with spaces don't calculate a score
	3) on create player, redraw player select list
 */

$(document).ready(function() {
	
	//no idea why I can't get these with jquery selectors
	document.getElementById("scoreButton").addEventListener("click", beenClicked, false);
	document.getElementById("addAndReturn").addEventListener("click", userCreate, false);
	document.getElementById("startDiscGolfing").addEventListener("click", setUpScorecard, false);
	document.getElementById("fullScorecardButton").addEventListener("click", populateLongCard, false);
	document.getElementById("endgameResetButton").addEventListener("click", startNewGame, false);
	document.getElementById("midgameResetButton").addEventListener("click", startNewGame, false);

    var current_version = getCurrVersion();

    $("#versionNumber").text(current_version);

	newGameFlag = 0;

	if (localStorage.getItem('currentGame') == "") {//Is this catching both null (never been set) and [] (I cleared it)?
		//alert('There is NO game data');
		newGameFlag = 1;
		localStorage.setItem("currentHole", 1);//this is also in startNewGame()
		document.getElementById("firstButton").style.visibility = "visible";
		document.getElementById("continueButton").style.visibility = "hidden";
		loadPlayers();//located in playerSelectLib.js.  This loads players in memory to player selector tool
	}
	else {
		currentPlayers = JSON.parse(localStorage.getItem('currentGame'));
		//alert(currentPlayers);
		//Set button visibility, so can only select "continue" and not "new game"
		document.getElementById("firstButton").style.visibility = "hidden";
		document.getElementById("continueButton").style.visibility = "visible";
		//alert(currentPlayers[0].Scores.length);//This is showing "2" when 2 players are present
		localStorage.setItem("currentHole", currentPlayers[0].Scores.length + 1);//You're on the hole after the last one you scored
		//alert("Current hole is: " + localStorage.getItem("currentHole"));
		setHoleDisplay();
		setUpScorecard();//***Does this have a window.location that prevents me from getting to setHoleDisplay?
	}
	
	//NOT REACHING HERE when restoring game.  WHY?  Workaround by adding setHoleDisplay() into else{} above
	setHoleDisplay();
	
});

function alertTest() {
	alert("You are in AlertTest");
}


function beenClicked() {//This is when the "enter scores" button is clicked.  Work on naming conventions.  ;)
	//input name is [player]Score, so loop on currentplayers usernames
	//don't localStorage all the scores.  put them in currentPlayers array, on Score end of the objects
	
	for (var i=0; i<currentPlayers.length; i++) {
		
		var relevantRadio = currentPlayers[i].Username + "score";
		currentPlayers[i].Scores.push(parseInt(getRadioValue(relevantRadio)));
				
	}
	
	//push updates to scorecard
	updateScores();
	
	//increment current hole
	var tempHole = parseInt(localStorage.getItem("currentHole")) + 1;
	localStorage.setItem("currentHole", tempHole);
	
	//refresh display
	setHoleDisplay();
	
	//check the "par" boxes so we don't get NaN next time
	resetScoreEntry();
	
	//if we're on hole 19, go to final score.
	if (tempHole > 19) {//*******************TEMP @ 3 FOR TESTING
		endgame();
	}
}

function getCurrVersion() {
    $.ajax({
        type: "GET",
	    url: "config.xml",
	    dataType: "xml",
	    success: function(xml) {
            var version = $(xml).find('widget').attr('version');
            return version
	    }
        });

    return ""
}

function userCreate() {
	var newName = document.getElementById("nameText").value;
	var fail = false;
	
	for (var i=0; i<playerArray.length; i++) {//consider scope issues with playerArray (in playerSelectLib.js)
		if (playerArray[i].Username == newName) {
			fail = true;//to prevent dupes
			//should be a break here?
		}
	}
	
	if (!fail) {
		playerArray.push({"Username":newName, "Scores":[]});
		localStorage.setItem("players", JSON.stringify(playerArray));
		loadPlayers();
	}
	
	
	
}

function userDelete(dyingUsername) {
	//This is not yet implemented
	//Need a page with the username checkbox list and a delete button
	
	
	var indexToDelete;
	
	//loop on playerArray and identify the index of the username - but how?
	//I'd really like to use index = playerArray.indexOf(username), but it's not an array of usernames, it's an array of objects
	
	//BEST ANSWER:
	//indexToDelete = myArray.map(function(e) { return e.Username; }).indexOf(dyingUsername);
	//playerArray.split(indexToDelete,indexToDelete)//This should "snip" from playerArray the item at the selected position from the previous line
	//localStorage.setItem("players", JSON.stringify(playerArray));//copied from userCreate, should still work here
	
}

function startNewGame() {
	//Reset the game by clearing out temporary variables and returning to player select screen
	
	if (confirm("Start a new game?")) {
		//First, set current hole to 1
		localStorage.setItem("currentHole", 1);
		
		//then, dump current score data from localStorage
		localStorage.setItem("currentGame", []);
		
		//then dump it from local variable
		currentPlayers = [];
		
		//then navigate to home
		window.location = "index.html"
	}
}

function setUpScorecard() {
    var x;
	if (newGameFlag == 1) {//get players from the ones chosen in the player selector
		//alert("in newgameflag=1")
		x = $("#playerselector option:selected").map(function(){ return this.value }).get();
	}
	else {//not a new game, grab players from currentPlayers data (pulled from localStorage)
		var usernameArray = [];
		currentPlayers.forEach(function(player) {
				usernameArray.push(player["Username"]);
				x = usernameArray
			});
	}
	
	
	//NEED TO CLEAN OUT playerUL before running this, to prevent cartesian product
	$("#playerUL li").remove();//This should clear out the scorecard before repopulating (on main scorecard only)
								//works for first iteration but not second BECAUSE Making more ULs?  Or not ....
	x.forEach(function(yEntry) {
		//add player to in-memory list of currentPlayers
		if (newGameFlag == 1) {//PREVENT CARTESIAN PRODUCT
			addPlayers(yEntry);
		}
		
		//create LIs in "playerUL"
		var myUL = document.getElementById("playerUL");
		var thisLI = document.createElement("li");
		var tempname = yEntry + "total"
		thisLI.innerHTML = "<a href='#' id="+tempname+">" + yEntry + "<span class='ui-li-count'></span></a>";
		myUL.appendChild(thisLI);
		
		//create fieldset, legend, input on "scoreEntryDiv"
		var currDIV = document.getElementById("scoreEntryDiv");
		
		var thisFieldset = document.createElement("fieldset");
		currDIV.appendChild(thisFieldset);
		
		var thisLegend = document.createElement("legend");
		thisLegend.innerText = yEntry + " Score:";
		thisFieldset.appendChild(thisLegend);
		
		var thisLabel = document.createElement("label");
		thisLabel.setAttribute("for", yEntry + "Ace");
		thisLabel.innerText = "Ace";
		thisFieldset.appendChild(thisLabel);
		var thisLabel2 = document.createElement("label");
		thisLabel2.setAttribute("for", yEntry + "Birdie");
		thisLabel2.innerText = "Birdie";
		thisFieldset.appendChild(thisLabel2);
		var thisLabel3 = document.createElement("label");
		thisLabel3.setAttribute("for", yEntry + "Par");
		thisLabel3.innerText = "Par";
		thisFieldset.appendChild(thisLabel3);
		var thisLabel4 = document.createElement("label");
		thisLabel4.setAttribute("for", yEntry + "Bogey");
		thisLabel4.innerText = "Bogey";
		thisFieldset.appendChild(thisLabel4);
		var thisLabel5 = document.createElement("label");
		thisLabel5.setAttribute("for", yEntry + "DoubleBogey");
		thisLabel5.innerText = "DoubleBogey";
		thisFieldset.appendChild(thisLabel5);
		var thisLabel6 = document.createElement("label");
		thisLabel6.setAttribute("for", yEntry + "Turkey");
		thisLabel6.innerText = "Turkey";
		thisFieldset.appendChild(thisLabel6);
		
		var thisInput = document.createElement("input");
		thisInput.name = yEntry + "score";
		thisInput.id = yEntry + "Ace";
		thisInput.value = -2;
		thisInput.type = "radio";
		thisFieldset.appendChild(thisInput);
		var thisInput2 = document.createElement("input");
		thisInput2.name = yEntry + "score";
		thisInput2.id = yEntry + "Birdie";
		thisInput2.value = -1;
		thisInput2.type = "radio";
		thisFieldset.appendChild(thisInput2);
		var thisInput3 = document.createElement("input");
		thisInput3.name = yEntry + "score";
		thisInput3.id = yEntry + "Par";
		thisInput3.value = 0;
		thisInput3.type = "radio";
		thisFieldset.appendChild(thisInput3);
		var thisInput4 = document.createElement("input");
		thisInput4.name = yEntry + "score";
		thisInput4.id = yEntry + "Bogey";
		thisInput4.value = +1;
		thisInput4.type = "radio";
		thisFieldset.appendChild(thisInput4);
		var thisInput5 = document.createElement("input");
		thisInput5.name = yEntry + "score";
		thisInput5.id = yEntry + "DoubleBogey";
		thisInput5.value = +2;
		thisInput5.type = "radio";
		thisFieldset.appendChild(thisInput5);
		var thisInput6 = document.createElement("input");
		thisInput6.name = yEntry + "score";
		thisInput6.id = yEntry + "Turkey";
		thisInput6.value = +3;
		thisInput6.type = "radio";
		thisFieldset.appendChild(thisInput6);
		
		//format all fieldsets via jquery
		$('fieldset').attr('data-role', 'controlgroup').attr('data-type', 'horizontal');
	});
	
	//set all initial scores to zero for new game, or actual for reloaded game
	updateScores();
	
	//pre-check "par" buttons for first time
	resetScoreEntry();
}

function populateLongCard() {
	//var x = $("#playerselector option:selected").map(function(){ return this.value }).get();
	//var drawArea = $("#fullscorecard p");
	
	
	/*Start old system
	
	currentPlayers.forEach(function(thisPerson) {
		//alert(thisPerson.Username);
		
		$("#fullScorecard span").append(thisPerson.Username);
		thisPerson.Scores.forEach(function(thisScore) {
			$("#fullScorecard span").append(" " + thisScore);
		})
		$("#fullScorecard span").append("<br/>");
	})
	
	*/
	
	
	/* Start new system*/
	
	$("#fullScorecard").text("");
	
	var table = $("<table></table>").css("border","1px solid black").css("width","100%").css("border-collapse","collapse");
	
	var firstRow = $("<tr></tr>").text("Holes: ");
	
	for (i=1; i< 20; i++) {
		var holeData = $("<td></td>").css("border","1px solid black").text(i);
		firstRow.append(holeData);
	}
	
	var totalBox = $("<td></td)").text("TOTAL");
	firstRow.append(totalBox);
	
	var pbBox = $("<td></td>").text("PB");
	firstRow.append(pbBox);
	
	var avgBox = $("<td></td>").text("Average");
	firstRow.append(avgBox);
	
	table.append(firstRow);
	
	currentPlayers.forEach(function(thisPerson) {
		var totalScore = 0;
		
		var row = $("<tr></tr>").text(thisPerson.Username).css("border","1px solid black");
		thisPerson.Scores.forEach(function(thisScore) {
			totalScore += thisScore;
			var td = $("<td></td>").css("border","1px solid black").text(thisScore);
			row.append(td);
		})
		
		for (i=0; i<(19-thisPerson.Scores.length); i++) {
			var td = $("<td></td>").css("border","1px solid black")
			row.append(td);
		}
		
		var totalTd = $("<td></td>").css("border","1px solid black").css("font-weight","bold").text(totalScore);
		
		row.append(totalTd);
		
		//get perm data, fish out scores, calc lowest and avg
		var pb = getPb(thisPerson.Username);
		var avg = getAvg(thisPerson.Username);
		
		var pbTd = $("<td></td>").css("border","1px solid black").text(pb);
		//$("<td></td>").css("border","1px solid black").css("font-weight","bold").text(totalScore);//
		row.append(pbTd);
		var avgTd = $("<td></td>").css("border","1px solid black").text(avg);
		row.append(avgTd);
		
		table.append(row);
	
	})
	
	$("#fullScorecard").append(table);
	
}

function resetScoreEntry() {
	
	currentPlayers.forEach(function(currUser) {
		tempElementId = currUser.Username + "Par";
		document.getElementById(tempElementId).checked = true;
		}
	);
	
	$("input[type='radio']").checkboxradio("refresh");
	
}

function updateScores() {
	//This function updates the DISPLAY of the scores, not the data (which is in currentPlayers[i].Scores[]
	
	for (var i=0; i<currentPlayers.length; i++) {
		
		var selectorString = "#" + currentPlayers[i].Username + "total span";
		
		var tempTotal = 0;
		
		currentPlayers[i].Scores.forEach(function(oneHoleScore) {
			tempTotal += oneHoleScore;
		});
			
		
		if (tempTotal > 0) {
			$(selectorString).text("+" + tempTotal)
		}
		else {
			$(selectorString).text(tempTotal)
		}
	}
	
	localStorage.setItem("currentGame", JSON.stringify(currentPlayers))
	
}

function setHoleDisplay() {//No navigation, only sets display of hole number on Scorecard page
	var hole = localStorage.getItem("currentHole");
	//alert("In setHoleDisplay, with hole = " + hole);
	$("#headerDiv span").text(parseInt(hole) - 1);//to set "scores through hole X"
	$("#scoreEnterLink span").text("Enter scores for Hole " + hole); 
	
}
function endgame() {

	//Save permanent record of full-game scores
	updatePlayerData(currentPlayers);

	//below works in browser; not working on Android
	window.location.hash = "endgame";//window.location.assign("#endgame");
	var bestScore = 99;
	
	currentPlayers.forEach(function(currUser) {
		var total = 0;
		currUser.Scores.forEach(function(currScore){
			total += currScore;
		});
		
		if (total < bestScore)	{
			bestScore = total
			}
	});
	
	currentPlayers.forEach(function(currUser) {
		var total = 0;
		currUser.Scores.forEach(function(currScore){
			total += currScore;
		});
	
		if (total == bestScore) {
			$("#winnertext").append("<b>" + currUser.Username + " wins! ........... " + total + "</b><br>")
		}
		else {
			$("#winnertext").append(currUser.Username + " ................ " + total + "<br>")
		}
	
	})
}

function getRadioValue(theRadioGroup)
{
    var elements = document.getElementsByName(theRadioGroup);
	
    for (var i = 0, l = elements.length; i < l; i++)
    {
        if (elements[i].checked)
        {
            return elements[i].value;
        }
    }
}
