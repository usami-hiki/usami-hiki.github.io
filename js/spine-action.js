/**
 *
 */
$.holdReady(true);

const anim_default = [ "Start", "Idle" ];
const anim_default_o = [ {name : "Start"}, { name : "Idle"} ];
const base_default = [ "Relax" ];
const base_default_o = [ {name : "Relax"} ];

const jsonList = {
	chars : "./json/charadata.json"
};

var db = {}
LoadAllJsonObjects(jsonList).then(function(result) {
    db = result
    $.holdReady(false);
});

var animations;
var animationqueue;
var togglenum = true;

$(document).ready(function() {

	$.each(["6", "5", "4", "3", "2", "1"], function(name, rarity) {

		var grp = $('<optgroup>')
			.addClass("head" + rarity)
			.attr('label', '☆' + rarity);

		$.each(db.chars.filter(data => data.rarity == rarity), function (name, value) {
			$option = $('<option>')
			.val(value.folder)
			.text(value.name);
			grp.append($option);
		});

		$("#ope").append(grp);
	});

	$("#ope").change(function (){

		$("#coord").children().remove();
		$.each(db.chars.find(data => data.folder == $("#ope").val()).coordinates, function (name, value) {
			$option = $('<option>')
				.val(value.filename)
				.text(value.name);
			$("#coord").append($option);
		});
		$("#coord").change();
	});

	$("#coord").change(function (){

		$("#type").children().remove();
		$.each(db.chars.find(data => data.folder == $("#ope").val()).coordinates.find(data => data.filename == $("#coord").val()).type, function (name, value) {
			$option = $('<option>')
				.val(value)
				.text(value);
			$("#type").append($option);
		});

		$("#type").change();
	});

	$("#type").change(function(){

		$("#ope,#coord,#type").prop("disabled", true);
		animations = $("#type").val() == "base" ? base_default_o : anim_default_o;
		LoadAnimation($("#type").val() == "base" ? base_default : anim_default);
	});

	$("#clear").click(function (){
		$("#play_list").val("");
	});

	$("#play").click(function (){
		LoadAnimation($("#play_list").val().split("\n"), $("#custom-check-1").prop("checked"));
	});
});

function LoadAnimation(animation_list, endloop = false, skipStart = false, isendstop = false) {
	var xhr = new XMLHttpRequest();
	var base = $("#type").val() == "base" ? "build_" : "";
	var filepath = "spineassets/" + $("#type").val() + "/" + $("#ope").val() + "/" + base + $("#coord").val();
	xhr.open('GET', filepath + ".skel", true);
	xhr.responseType = 'arraybuffer';
	var array;

//	animation_list = CheckList(animation_list);

	xhr.onloadend = function(e) {
		if (xhr.status != 404) {
			buffer = xhr.response;
			array = new Uint8Array(buffer);
			skelBin = new SkeletonBinary();
			var jsonskel;
			skelBin.data = array;
			skelBin.initJson();
			jsonskel = JSON.stringify(skelBin.json);
			var parsedskeljson = JSON.parse(jsonskel);
			console.log(JSON.parse(jsonskel));

			var spineX = parseFloat($("#player-container").width()) / 2;
			var spineY = parseFloat($("#player-container").height()) / 2 - 200;
			new spine.SpineWidget("player-container", {
				jsonContent : jsonskel,
				atlas : filepath + ".atlas",
				// animation : [ "Start", "Idle", "Attack" ],
				//animation : "Default",
				animation : $("#type").val() == "base" ? "Relax" : "Default",
				backgroundColor : "#00000000",
				premultipliedAlpha : true,
				fitToCanvas : false,
				loop : true,
				x : spineX,
				y : spineY,
				scale : 1,
				success : function(widget) {
					var animIndex = 0;

					animations = widget.skeleton.data.animations;
					animation_list = CheckList(animation_list);
					CreateAnimation(widget, animation_list, endloop, skipStart, isendstop);

					InitActions(animations);

					// widget.canvas.onclick = function () {
					$(widget.canvas).off("click");
					$(widget.canvas).click(function() {
						if (togglenum) {
							clearInterval(animationqueue);
							widget.state.clearTracks();
							togglenum = false;
						} else {
							CreateAnimation(widget, animation_list, endloop, skipStart, isendstop);
							togglenum = true;
						}
					});
					$(widget.canvas).off("dblclick");
					$(widget.canvas).dblclick(function(){
						Mirror($("#player-container"));
					})

					// widget.canvas.onclick = function() {
					// animIndex++;
					// let animations = widget.skeleton.data.animations;
					// if (animIndex >= animations.length)
					// animIndex = 0;
					// widget.setAnimation(animations[animIndex].name);
					// }

					$("#ope,#coord,#type").prop("disabled", false);
				},
				error : function(obj) {
					console.log(obj);

					$("#ope,#coord,#type").prop("disabled", false);
				}
			});
		} else {
			$("#loading-spine").text("Load Failed");
		}
	};
	xhr.send();
}

function CheckList(animation_list){
	const ret = animation_list.filter(action => animations.find(anim => anim.name === action) != undefined);

	$("#play_list").val(ret.join("\n"));
	if(ret.length > 0) {
		return ret;
	}
	return ["Default"];
}

function InitActions(animation_list) {

	$("#action_list").children().remove();
	$.each(animation_list, function (name, value) {
		$("#action_list").append(
			$('<div>')
				.addClass("form-control")
				.addClass("action")
				.css("cursor", "pointer")
				.text(value.name)
				.click(function(){
					$("#play_list").val($("#play_list").val() + ($("#play_list").val()=="" ? "" : "\n") + $(this).text());
				})
		);
	});

}

function CreateAnimation(chibiwidget, animArray, endloop = false, skipStart = false, isendstop = false) {
	if (Array.isArray(animArray) && animArray.length > 1) {
		var delay = 0;
		var animNum = 0;
		if (animationqueue != undefined) {
			clearInterval(animationqueue);
		}
		var curranimplay = Array.isArray(animArray[0]) ? animArray[0][0] : animArray[0];
		if (chibiwidget.loaded) {
			chibiwidget.setAnimation(curranimplay);
		}
		chibiwidget.state.clearTracks();
		var curranimations = chibiwidget.skeleton.data.animations;
		animArray.forEach(element => {
			var curranim = element;
			var animTimes = 1;
			var isloop = animNum == animArray.length - 1;
			if (Array.isArray(element)) {
				curranim = element[0];
				animTimes = element[1];
				isloop = true;
			}
			if (animNum == 0) {
				chibiwidget.state.setAnimation(0, curranim, Array.isArray(animArray[0]) && animArray[0].length > 1 ? true : false);
			} else if (animNum == animArray.length - 1) {
				chibiwidget.state.addAnimation(animNum, curranim, !isendstop, delay);
			} else {
				chibiwidget.state.addAnimation(animNum, curranim, isloop, delay);
			}
			delay += curranimations[GetAnimationIndex(curranimations, curranim)].duration * animTimes;
			animNum++;
		});
		if (endloop) {
			if (skipStart) {
				animArray.shift();
			}
			console.log(animArray);
			animationqueue = setInterval(function() {
				var delay = 0;
				var animNum = 0;
				var curranimplay = Array.isArray(animArray[0]) ? animArray[0][0] : animArray[0];
				if (chibiwidget.loaded) {
					chibiwidget.setAnimation(curranimplay);
				}
				chibiwidget.state.clearTracks();
				animArray.forEach(element => {
					var curranim = element;
					var animTimes = 1;
					var isloop = animNum == animArray.length - 1;
					if (Array.isArray(element)) {
						curranim = element[0];
						animTimes = element[1];
						isloop = true;
					}
					if (animNum == 0) {
						chibiwidget.state.setAnimation(0, curranim, Array.isArray(animArray[0]) && animArray[0].length > 1 ? true : false);
					} else {
						chibiwidget.state.addAnimation(animNum, curranim, isloop, delay);
					}
					delay += curranimations[GetAnimationIndex(curranimations, curranim)].duration * animTimes;
					animNum++;
					console.log(element);
				});
			}, delay * 1000 - 20);
		}
	} else {
		if (animationqueue != undefined) {
			clearInterval(animationqueue);
		}
		var curranimplay = Array.isArray(animArray[0]) ? animArray[0][0] : animArray;
		if (chibiwidget.loaded) {
			chibiwidget.setAnimation(curranimplay);
		}
		chibiwidget.state.clearTracks();
		chibiwidget.state.setAnimation(0, curranimplay, !isendstop);
	}
}

function GetAnimationIndex(anim, name){
	return anim.map(e => e.name).indexOf(name)
}

function LoadAllJsonObjects(obj) {
    var result = {}

    var promises = Object.entries(obj).map(function(url){
        return $.getJSON(url[1]).then(function(res){
            result[url[0]]=res
        })
    })

    return Promise.all(promises).then(function(){
        return result
    })
}

function Mirror(el){
    var currcss;

    currcss = $(el).css('transform');
    var regexcheck = /matrix\((.*)\)/g;
    var changex = regexcheck.exec(currcss)[1];
    var changex1 = changex.split(",");
    changex1[0] = changex1[0]*-1;
    $(el).css('transform','matrix('+changex1.join(",")+')');

}
