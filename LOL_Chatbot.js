const scriptName = "LOL_Chatbot.js";

function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName, threadId) {

	var lol_apiKey = "RGAPI-2dde4d17-50d6-428a-a8a2-44d41f3aeb41"; //temporal
 

	function to_HTML(url) { //conver url to html
		var data = Utils.getWebText(url);
		data = data.replace(/\t/g, '');
		data = data.replace(/(<([^>]+)>)/ig, "").trim();
		return data;
	}
	 
	function decodeEntities(encodedString) {  //decode html
		var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
		var translate = {
			"nbsp":" ",
			"amp" : "&",
			"quot": "\"",
			"lt"  : "<",
			"gt"  : ">"
		};
		return encodedString.replace(translate_re, function(match, entity) {
			return translate[entity];
		}).replace(/&#(\d+);/gi, function(match, numStr) {
			var num = parseInt(numStr, 10);
			return String.fromCharCode(num);
		});
	}

	function to_JSON(url) { //extract json from html
		
		obj = to_HTML(url);
		regex = /<html>|<body>|<head>|<\/head>|<.body>|<.html>/g; //remove certain tags
		obj = obj.replace(/<br>/g, "<br />").replace(/\r?\n/g, "");//remove certain tags 

		try{ //catch decoder error
			obj = decodeEntities(obj);
		}catch(e) {
			replier.reply("decoder error");
			return;
		}
		
	    try { //catch json parse error
			obj = JSON.parse(obj);
		} catch (e) {
			replier.reply("json parse error");
			return "error: string cannot be parsed as json";
		}
		return obj;
	}

	function lol_serverStatus() { //display server info 
		var url = "https://na1.api.riotgames.com/lol/status/v3/shard-data?api_key=" + lol_apiKey; //riot server api url
		obj = to_JSON(url);
		replier.reply("Current NA LOL server status is...\nLocation: " + obj.name + "\n" + obj.services[0].name + ": " + obj.services[0].status + "\n" + obj.services[1].name + ": " + obj.services[1].status + "\n" + obj.services[2].name + ": " + obj.services[2].status + "\n" + obj.services[3].name + ": " + obj.services[3].status + "\n"
		+ "Version: " + lol_lastestVer());
	}
	function lol_lastestVer() { //get current client version of LOL
		var url = "https://ddragon.leagueoflegends.com/api/versions.json"; //json url
		
		data  = Utils.getWebText(url);
		data = data.replace(/(<([^>]+)>)/ig, "").trim();
		  
		var str = "";
		for (i = 0; i < 20; i++) {
			if (parseInt(data[i]) || data[i] == "." || data[i] == "0")
			  str += data[i];
		   if (data[i] == ",")
			break;
		}
		return str;
	  }
	function replaceAll(find, replace,str) {     var re = new RegExp(find, 'g');      str = str.replace(re, replace);      return str; }
	function lol_jsonInterpreter(str, obj, champName, si) { //str = tooltip, obj = json //interpret league json's placeholders'
		effectBurn = obj.data[champName]["spells"][si]["effectBurn"];
		   res = (obj.data[champName]["spells"][si]["tooltip"]);
		for(i = 1; i < effectBurn.length; i++) {
				  effectIndex = "";
			effectIndex = "e" + i.toString();
				  replier.reply(effectIndex);
				  if(effectBurn[i] != null)
			res = replaceAll(effectIndex, effectBurn[i].toString(), res);//
		}
		res = res.replace(/{{|}}/g, "");
		return res;
	 }

	function lol_champInfo(champName, qwer, want_details) {
		var last_ver = lol_lastestVer();
		var url = "http://ddragon.leagueoflegends.com/cdn/" + last_ver + "/data/en_US/champion/" + champName + ".json";
		//replier.reply(url);
		try{
		obj =  to_JSON(url);
		}catch(e) {
		  replier.reply("No data found. Please check the input!");
		  return;
		}
		si = 0;
		if (qwer == "Q")
		  si = 0;
		if (qwer == "W")
		  si = 1;
		if (qwer == "E")
		  si = 2;
		if (qwer == "R")
		  si = 3;                
		str = "";      
		if (qwer == "stat") {
			str= "Name:  "+ (obj.data[champName]["name"]) + "\n"
			+ "Tag: " +(obj.data[champName]["tags"]) + "\n"
			+ "HP: " + (obj.data[champName]["stats"]["hp"]) + " (+" + (obj.data[champName]["stats"]["hpperlevel"]) + ")\n"
			+ "Mana: " +(obj.data[champName]["stats"]["mp"]) + (obj.data[champName]["stats"]["mpperlevel"]) + ")\n"
			+ "HP Regen: " +(obj.data[champName]["stats"]["hpregen"]) + " (+" + obj.data[champName]["stats"]["hpregenperlevel"] + ")\n"
			+ "MP Regen: " +(obj.data[champName]["stats"]["mpregen"]) + " (+" + obj.data[champName]["stats"]["mpregenperlevel"] + ")\n"
			+ "Movement Speed: " +(obj.data[champName]["stats"]["movespeed"]) + "\n"
			+ "Armor: " +(obj.data[champName]["stats"]["armor"]) + " (+" + obj.data[champName]["stats"]["armorperlevel"] + ")\n"
			+ "Magic Armor: " +(obj.data[champName]["stats"]["spellblock"]) + " (+" + obj.data[champName]["stats"]["spellblockperlevel"] + ")\n"
			+ "Auto Attack Range: " +(obj.data[champName]["stats"]["attackrange"]) + "\n"
			+ "AD: " +(obj.data[champName]["stats"]["attackdamage"]) + " (+" + obj.data[champName]["stats"]["attackdamageperlevel"] + ")\n"
			+ "Attack Speed: " +(obj.data[champName]["stats"]["attackspeed"]) + " (+" + obj.data[champName]["stats"]["attackspeedperlevel"] + ")." ;
			replier.reply(champName + "\'s Basic Status Info is...\n" + str);
		}
		else {
			str = "Name: " + (obj.data[champName]["spells"][si]["name"])+ "\n" + //si = skill index
				"Description: " + (obj.data[champName]["spells"][si]["description"])+ "\n";
			if(want_details == "Details") 
				str = str  + "Tooltip: " + lol_jsonInterpreter((obj.data[champName]["spells"][si]["tooltip"]), obj, champName, si)+ "\n";
			str = str +  "Amount: " + (obj.data[champName]["spells"][si]["effectBurn"][1])+ "\n" +
				"Cost: " + (obj.data[champName]["spells"][si]["costBurn"])+ "\n" +
				"Cooldown: " + (obj.data[champName]["spells"][si]["cooldownBurn"]);
			replier.reply(champName + "''s "+ qwer + " Skill Info is... \n" + str + ".");
		}
	}

	function replaceChar(origString, replaceChar, index) {
		let firstPart = origString.substr(0, index);
		let lastPart = origString.substr(index + 1);
		let newString = firstPart + replaceChar + lastPart;
		return newString;
	}

	function lol_tier1Champs(str)  {//pos = position (mid, top...)
	 url = "https://www.op.gg/champion/statistics?l=en_US" // op.gg stat page
	temp_str =  "<div class=\"detail-ranking__content detail-ranking__content--champ-list ChampionRankingList-WinRatio-"+ str + " tabItem\" style=\"display: none;\"> "//to indicate split
	try {
		obj = Utils.getWebText(url);
	}catch(e) {
		replier.reply("Server is not responding. Try it later!");
		return;
	}
	//replier.reply(obj);
	obj = obj.split(temp_str)[1];
	obj = obj.split("<div class=\"champion-ratio__rank\">");
	 
	for (i =1; i<6; i++) {
		obj[i] = obj[i].replace(/(<([^>]+)>)/ig, "").replace(/(\s\s\s\s)+/mg, "");
	}
	  
	var res = "Current "+ str + " lane's top 5 champions...\n";
	for (i =1; i<6; i++) {
		res = res + i +"."+ obj[i].substr(7, obj[i].length) + " \n";
	}
	replier.reply(res +".");

	}
	function sleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds){      
			  break;
			}
		}
	}

	function jg_times() {
		str = "Jungle Mobs Table: \nName | Start | Regen\n" 
		+ "Birds | 1:30 | 2:00\n"
		+ "Wolves | 1:30 | 2:00\n"
		+ "Golems | 1:42 | 2:00\n"
		+ "Gromp | 1:42 | 2:00\n"
		+ "Crab | 3:15 | 2:30\n"
		+ "Blue/Red | 1:30 | 5:00\n"
		+ "Rift | 8:00 | 6:00\n"
		+ "Baron | 20:00 | 6:00\n"
		+ "Dragon | 5:00 | 5:00\n"
		+ "Elder | +6:00 | 6:00.";
		replier.reply(str);
	}

	if (msg.includes( "/champ_stat")) {  
		if (msg == "/champ_stat") {
		 replier.reply("/input your data in this format: /champ_skill,{champ name}.");
		}
	 else {
		cname = msg.split(",")[1];
		lol_champInfo(cname, "stat");
		}
	}

	if (msg.includes( "/champ_skill")) {
		if (msg == "/champ_skill") {
		 replier.reply("/input your data in this format: /champ_skill,{champ name},{skill key}.");
		}
		else {
		msg_array = msg.split(",");
		cname = msg_array[1];
		skillkey = msg_array[2];
		want_details = msg_array[3];
		lol_champInfo(cname, skillkey, want_details);
		}
	}
	//bot if  actions 
	if (msg=="/top")
		lol_tier1Champs("TOP");

	if (msg=="/jg")
		lol_tier1Champs("JUNGLE");

	if (msg=="/mid")
		lol_tier1Champs("MID");
	if (msg=="/adc"||msg=="/bot")
		lol_tier1Champs("ADC");
	if (msg=="/sup")
		lol_tier1Champs("SUPPORT");
	if (msg=="/mob")
		jg_times();
	if (msg == "/server") 
		lol_serverStatus();
	if (msg.includes('/t ')) 
	      replier.reply( Api.papagoTranslate('en' ,'ko', msg.substring(3, msg.length)) );  
	    
    	if(msg.includes('/번역 ') || msg.includes('/tk '))
	      replier.reply( Api.papagoTranslate('ko', 'en',  msg.substring(4, msg.length)) );
	    
}
function onStartCompile() {

}
function onCreate(savedInstanceState, activity) {
  var layout = new android.widget.LinearLayout(activity);
  layout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
  var txt = new android.widget.TextView(activity);
  txt.setText("");
  layout.addView(txt);
  activity.setContentView(layout);
}
function onResume(activity) {
}
function onPause(activity) {
}
function onStop(activity) {
}
