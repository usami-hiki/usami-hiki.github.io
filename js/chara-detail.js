
    const jsonList = {


    };

    var db = {}

    var lang;
    var reg;
    var selectedOP;
    var lefthand;
    var opdataFull = {};
    var curpath;
    var opapp;
    var classfilter;
    var sort;
    var skeletonType = "skel"
    var chibitype = 'character'
    var charName = 'char_010_chen_nian_2';
    var chibipers = 'front'
    var chibiName = 'char_010_chen_nian_2'
    var folder = `./spineassets/${chibitype}/${charName}/${chibipers}/`
    var spinewidget

    var currskin
    var spinewidgettoken
    var animIndex = 0;
    var animations
    var tokenname
    var tokenanimations
    var animationqueue
    var defaultAnimationName = "Default";
    var loadchibi = false;
    // var chibiscaleweb = 0
    // var chibiscaleweblist = [[0.5,-775],[0.6,-800],[0.7,-825],[0.8,-850],[0.9,-875],[1,-900]]
    var chibiscale = [0.5,0]
    var chibiperscurr = 0
    var chibiperslist = ["front","back","build"]
    var bgnum =0
    var bgmax = 5
    var scrollcheck = 0
    var savenum = 0

    var canvasNum = 0
    var canvasSize = [[1800,1800],[1200,800],[800,800],[600,600],[500,500]]
    var wid = 1800
    var hei = 1800

    $(document).ready(function(){
        $(window).scroll(function(){
            var sticky = $('#ak-bottom-allnav'),
                scroll = $(window).scrollTop();
                isScrollUp = scroll<scrollcheck
            // console.log(scroll)
            scrollcheck = scroll

            if(loadchibi){
                if (scroll >= 500) {
                    sticky.removeClass('fixedNav');
                    sticky.removeClass('fixedNav1');
                    sticky.addClass('fixedNav2')
                }
                else if(scroll>=400&&!isScrollUp){
                    sticky.addClass('fixedNav');
                    sticky.removeClass('fixedNav2');
                } else if(scroll>=400&&isScrollUp){
                    sticky.addClass('fixedNav1');
                    sticky.removeClass('fixedNav2');
                }else{
                    sticky.removeClass('fixedNav');
                    sticky.removeClass('fixedNav1');
                    sticky.removeClass('fixedNav2');
                }
            }
        });

        $(window).click(function() {
            $('#operatorsResult').empty();
            $('#operatorsResult').hide();
        });

//        dragElement(document.getElementById("spine-frame"));
//        dragElement(document.getElementById("spine-frame-token"));

    });

    function selectOperator(opname,from='Selecting Operator From Browse'){
        $("#opchoosemodal").modal('hide');
        if(opname != ""){

            charName = opcode;
            chibiName = opcode
            console.log(chibipers)
            if(chibipers=='build') chibiName= "build_"+chibiName
            console.log(chibiName)
            folder = `./spineassets/${chibitype}/${charName}/${chibipers}/`
            // if(spinewidget)


            if(loadchibi){
                LoadAnimation()
                LoadAnimationToken()
                // $("#spine-frame").fadeIn(10)
            }
            else $("#spine-frame").hide()

        }
    }

    function LinkCheck(url)
    {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status!=404;
    }

    function ChangeSkillAnim(skillnum,skillmax,token){
        // console.log(skillnum)
        // console.log(token)
        // console.log(skillmax)
        console.log(token)
        tokenname = token
        if(spinewidgettoken&&token&&spinewidgettoken.loaded){

            LoadAnimationToken(token)
        }
        if(spinewidget&&spinewidget.loaded){

            var animskill = db.animlist[opdataFull.id]
            console.log(skillnum)
            if(animskill && animskill.skills[skillnum]){
                $("#spine-text").text(`Skill ${skillnum+1}`)
                CreateAnimation(spinewidget,animskill.skills[skillnum],true)
            }
            else{
                var animlist = Object.keys(spinewidget.customanimation).filter(search=>search.includes("Skill"))

                animlist=animlist.sort((a,b)=>{
                    if(a<b)return 1
                    if(a>b)return -1
                    return 0
                })

                if(animlist&&animlist.length>0){
                    // console.log(animlist)
                    // console.log(skillmax-skillnum-1)

                    if(animlist[skillmax-skillnum-1]){
                        $("#spine-text").text(`Skill ${skillnum+1}`)
                        // console.log()
                        CreateAnimation(spinewidget,spinewidget.customanimation[animlist[skillmax-skillnum-1]],true)
                    }
                }
            }

        }
    }

    function LoadAnimation(){
        // console.log(spinewidget)
        $("#loading-spine").text("Loading...")
        if(spinewidget){
            spinewidget.pause()
            spinewidget = undefined
        }
        // else{
        //     if(loadchibi)$("#spine-frame").fadeIn(100);
        // }
        $("#spine-widget").remove()
        $("#spine-frame").append(`<div id="spine-widget" class="top-layer" style="position:absolute;width: ${wid}px; height: ${hei}px;top:${-hei/2+150 +chibiscale[1]}px;left:-${wid/2-150}px;pointer-events: none;z-index: 20;transform: scale(${chibiscale[0]});"></div>`)
        if (chibiName != null && defaultAnimationName != null) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', folder + chibiName + "." +skeletonType, true);
            xhr.responseType = 'arraybuffer';
            var array;
            $("#spine-widget").hide()
            var defaultskin ='default'

            $("#loading-spine").fadeIn(200)
            console.log(chibiName)
            xhr.onloadend = function (e) {
                if (xhr.status != 404) {
                    buffer = xhr.response;
                    array = new Uint8Array(buffer);
                    // console.log(array);
                    skelBin = new SkeletonBinary();
                    var jsonskel
                    if(array.length==0){
                        $("#loading-spine").text("Load Failed")
                    }
                    if (skeletonType== "skel"){
                        skelBin.data = array
                        skelBin.initJson()
                        jsonskel = JSON.stringify(skelBin.json)
                        var parsedskeljson = JSON.parse(jsonskel)
                        console.log(JSON.parse(jsonskel))
                        if(!Object.keys(parsedskeljson.animations).find(search=>search==defaultAnimationName)){
                            defaultAnimationName = Object.keys(parsedskeljson.animations)[0]
                        }
                        if(!Object.keys(parsedskeljson.skins).find(search=>search==defaultskin)){
                            defaultskin = Object.keys(parsedskeljson.skins)[0]
                        }
                    }else if (skeletonType== "json"){
                        jsonskel = JSON.parse(new TextDecoder("utf-8").decode(array))
                        var parsedskeljson = jsonskel
                        console.log(JSON.parse(jsonskel))
                        if(!Object.keys(parsedskeljson.animations).find(search=>search==defaultAnimationName)){
                            defaultAnimationName = Object.keys(parsedskeljson.animations)[0]
                        }
                        if(!Object.keys(parsedskeljson.skins).find(search=>search==defaultskin)){
                            defaultskin = Object.keys(parsedskeljson.skins)[0]
                        }
                    }



                    // var test = new TextDecoder("utf-8").decode(array);
                    // console.log(JSON.parse(test))
                    // console.log(JSON.stringify(skelBin.json, null, "\t"));
                    var spineX = parseFloat($("#spine-widget").width())/2
                    var spineY = parseFloat($("#spine-widget").height())/2 -200

                    // console.log(spineX)
                    // console.log(spineY)
                    new spine.SpineWidget("spine-widget", {
                        jsonContent: jsonskel,
                        atlas: folder + chibiName + ".atlas",
                        animation: defaultAnimationName,
                        backgroundColor: "#00000000",
                        // debug: true,
                        // imagesPath: chibiName + ".png",
                        premultipliedAlpha: true,
                        fitToCanvas : false,
                        loop:true,
                        // x:900,
                        // y:650,
                        x:spineX,
                        y:spineY,
                        //0.5 for normal i guess
                        scale:1,
                        success: function (widget) {

                            animIndex=0
                            spinewidget = widget
                            $("#spine-text").text(widget.skeleton.data.animations[0].name)
                            $("#loading-spine").fadeOut(200)
                            animations = widget.skeleton.data.animations;
                            // console.log(animations)
                            // console.log(widget)
                            $("#spine-widget").show()
                            if(animations.find(search=>search.name=="Start")){
                                CreateAnimation(spinewidget,["Start","Idle"])
                                $("#spine-text").text("Idle")
                            }else if(animations.find(search=>search.name=="Relax")){
                                CreateAnimation(spinewidget,"Relax")
                                $("#spine-text").text("Relax")
                            }

                            // CreateAnimation(["Skill_Begin",["Skill_Loop",5],"Skill_End","Idle"],true)
                            // CreateAnimation(["Skill_2_Begin",["Skill_2_Loop",5],"Skill_2_Loop_End","Idle"],true)

                            widget.customanimation = CheckAnimationSet(animations)
                            // console.log(widget)


                            //ange skill 2
                            // CreateAnimation(["Skill1_Begin",["Skill1_Loop",15],"Skill1_End",["Idle_Charge",2]],true)

                            //ange skill 3 (is weird)
                            // CreateAnimation(["Skill2_Begin",["Skill2_Loop",15],"Skill2_End",["Idle_Charge",2]],true)

                            // Normal skill loop with begin and idle i guess (nian skill 2)
                            // CreateAnimation(["Skill_2_Begin",["Skill_2_Loop",5],"Skill_2_Idle"],true,true)


                            // console.log(widget.state)
                            // console.log(widget.state.trackEntry)
                            $("#spine-toolbar-next").onclick = function () {
                                widget.state.clearTracks()
                                if(animationqueue!=undefined)clearInterval(animationqueue)
                                animIndex++;
                                // console.log(animations)
                                if (animIndex >= animations.length) animIndex = 0;
                                widget.setAnimation(animations[animIndex].name)
                                $("#spine-text").text(animations[animIndex].name)
                            }
                        }
                    })
                }else{
                    $("#loading-spine").text("Load Failed")
                    // $("#spine-frame").fadeOut()
                }
            };
            xhr.send()
        }
    }

    function ChangeAnimation2(widget,widgettext,num){
        if(widget=="token") widget=spinewidgettoken
        else widget=spinewidget

        var curranimation = Object.keys(widget.customanimation)
        widget.state.clearTracks()
        if(animationqueue!=undefined)clearInterval(animationqueue)
        animIndex += num;
        // console.log(animIndex)
        // console.log(curranimation)

        if (animIndex >= curranimation.length) animIndex = 0;
        else if (animIndex < 0) animIndex = curranimation.length-1;
        // spinewidget.state.setDefaultMix(0.1);
        // spinewidget.config.scale = 2
        // console.log(widget)
        // console.log(animIndex)
        // widget.setAnimation(curranimation[animIndex].name)
        // console.log(widget.customanimation[Object.keys(widget.customanimation)[animIndex]])

        CreateAnimation(widget,widget.customanimation[Object.keys(widget.customanimation)[animIndex]],true)
        // console.log(widgettext)
        $(widgettext).text(Object.keys(widget.customanimation)[animIndex])
    }

    function ChangeAnimation(widget,widgettext,num){
        if(widget=="token") widget=spinewidgettoken
        else widget=spinewidget

        var curranimation = widget.skeleton.data.animations
        widget.state.clearTracks()
        if(animationqueue!=undefined)clearInterval(animationqueue)
        animIndex += num;
        // console.log(animIndex)
        // console.log(curranimation)

        if (animIndex >= curranimation.length) animIndex = 0;
        else if (animIndex < 0) animIndex = curranimation.length-1;
        // spinewidget.state.setDefaultMix(0.1);
        // spinewidget.config.scale = 2
        // console.log(widget)
        // console.log(animIndex)
        // widget.setAnimation(curranimation[animIndex].name)
        // console.log(widget.customanimation[Object.keys(widget.customanimation)[animIndex]])
        // console.log(curranimation[index])
        CreateAnimation(widget,curranimation[animIndex].name)
        // widget.setAnimation(curranimation[animIndex].name)
        // console.log(widgettext)
        $(widgettext).text(curranimation[animIndex].name)
    }

    function ChangeAnimation3(widget,animarray,endloop = false,skipStart = false,isendstop=false){
        if(widget=="token") widget=spinewidgettoken
        else widget=spinewidget

        widget.state.clearTracks()
        if(animationqueue!=undefined)clearInterval(animationqueue)

        CreateAnimation(widget,animarray, endloop, skipStart, isendstop)
    }


    function PlayPause(widget){
        if(widget=="token") widget=spinewidgettoken
        else widget=spinewidget
        if(widget.isPlaying()){
            console.log("Playing")
            widget.pause()
        }else{
            console.log("Paused")
            widget.play()
        }
    }

    function Mirror(el){
        var currcss
        currcss = $(el).css('transform')
        var regexcheck = /matrix\((.*)\)/g
        var changex = regexcheck.exec(currcss)[1]
        var changex1 = changex.split(",")
        changex1[0] = changex1[0]*-1
        $(el).css('transform','matrix('+changex1.join(",")+')')
        console.log(changex)
        $(el).toggleClass("MirrorDiv")


    }



    function CreateAnimation(chibiwidget,animArray,endloop = false,skipStart = false,isendstop=false){
        // console.log(animArray)

        // console.log(Array.isArray(animArray))
        // console.log(animArray.length>1)
        // console.log(Array.isArray(animArray[0]))

        if((Array.isArray(animArray)&&animArray.length>1)){
            // console.log("ayyyyyy")
            var delay = 0
            var animNum = 0
            if(animationqueue!=undefined)clearInterval(animationqueue)
            var curranimplay = Array.isArray(animArray[0])?animArray[0][0]:animArray[0]
            if(chibiwidget.loaded)chibiwidget.setAnimation(curranimplay)
            chibiwidget.state.clearTracks()
            var curranimations = chibiwidget.skeleton.data.animations
            animArray.forEach(element => {
                var curranim = element
                var animTimes = 1
                var isloop = animNum==animArray.length-1

                if(Array.isArray(element)){
                    curranim = element[0]
                    animTimes = element[1]
                    isloop = true
                }
                if(animNum==0)chibiwidget.state.setAnimation(0,curranim,Array.isArray(animArray[0])&&animArray[0].length>1?true:false)
                else if(animNum==animArray.length-1) chibiwidget.state.addAnimation(animNum,curranim,!isendstop,delay)
                else chibiwidget.state.addAnimation(animNum,curranim,isloop,delay)
                delay +=curranimations[GetAnimationIndex(curranimations,curranim)].duration*animTimes
                animNum++
                // console.log(element)
            });
            if(endloop){
                if(skipStart)animArray.shift()

                console.log(animArray)
                animationqueue = setInterval(function(){
                    var delay = 0
                    var animNum = 0
                    var curranimplay = Array.isArray(animArray[0])?animArray[0][0]:animArray[0]
                    if(chibiwidget.loaded)chibiwidget.setAnimation(curranimplay)
                    chibiwidget.state.clearTracks()
                    animArray.forEach(element => {
                        var curranim = element
                        var animTimes = 1
                        var isloop = animNum==animArray.length-1
                        if(Array.isArray(element)){
                            curranim = element[0]
                            animTimes = element[1]
                            isloop = true
                        }
                        if(animNum==0)chibiwidget.state.setAnimation(0,curranim,Array.isArray(animArray[0])&&animArray[0].length>1?true:false)

                        else chibiwidget.state.addAnimation(animNum,curranim,isloop,delay)
                        delay +=curranimations[GetAnimationIndex(curranimations,curranim)].duration*animTimes
                        animNum++
                        console.log(element)
                    });
                },delay*1000-20)
            }
        }else{
            // chibiwidget.state.setAnimation(animArray)
            // console.log("WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")

            if(animationqueue!=undefined)clearInterval(animationqueue)
            // console.log(animArray)

            var curranimplay = Array.isArray(animArray[0])?animArray[0][0]:animArray
            if(chibiwidget.loaded)chibiwidget.setAnimation(curranimplay)
            chibiwidget.state.clearTracks()

            chibiwidget.state.setAnimation(0,curranimplay,!isendstop)
        }
    }

    function CheckChibi(){
        console.log(spinewidget)
    }

    function CheckAnimationSet(anim){
        // console.log(anim)
        var curranimlist = {}
        if(anim.find(search=>search.name=="Interact")){
            //Build Mode
            // console.log("Is Build")

        }else if(anim.find(search=>search.name=="Idle")){
            //Battle Mode
            // console.log("Is Battle")
            anim.forEach(curranim => {
                var numberregx = /(\d)/
                var currsplit = curranim.name.split("_")[0]

                if(currsplit)
                var splitnum = numberregx.exec(curranim.name)
                if(splitnum){
                    var nameregex = /(.*)(?=\d)/g
                    var checkname = nameregex.exec(currsplit)
                    // console.log(checkname[0])
                    if(checkname)currsplit = checkname[0]
                    // console.log(checkname[0])
                    splitnum=splitnum[0]
                }
                else if (!splitnum) splitnum=""

                if(!curranimlist[`${currsplit}${splitnum}`]){
                    curranimlist[`${currsplit}${splitnum}`] = []
                }
                if(!curranim.name.includes("Down")){
                    curranimlist[`${currsplit}${splitnum}`].push(curranim.name)
                }

            });
            Object.keys(curranimlist).forEach(keys => {
                curranimlist[keys]= curranimlist[keys].sort((a,b)=>{
                    var sortarray = [
                        "Pre",
                        "Begin",
                        "Start",
                        "Idle",
                        "",
                        "Loop",
                        "End",
                        "Die"
                    ]
                    var anum = 0
                    var bnum = 0
                    for(i=0;i<sortarray.length;i++){
                        // console.log(sortarray[i])
                        if(sortarray[i]==""){
                            var isAfree = true
                            var isBfree = true
                            for(j=0;j<sortarray.length;j++){
                                if(sortarray[j]!=""){
                                    if(a.includes(sortarray[j]))isAfree=false
                                    if(b.includes(sortarray[j]))isBfree=false
                                }
                            }
                            if (isAfree) anum += 4
                            if (isBfree) bnum += 4
                        }else{
                            if(a.includes(sortarray[i]))anum+=i+1
                            if(b.includes(sortarray[i]))bnum+=i+1
                        }
                    }
                    return anum - bnum

                })
                // curranimlist[keys].forEach(element => {
                //     if(curranimlist[keys].length>=2&&(element.includes("Loop")||element.includes("Idle"))){
                //         console.log(element)
                //         element = [element,5]
                //     }
                // });
                if(curranimlist[keys].find(search=>search.includes("End"))){
                    if(anim.find(search=>search.name.includes("Idle_Charge"))) curranimlist[keys].push("Idle_Charge")
                    else curranimlist[keys].push("Idle")
                }
                if(curranimlist[keys].find(search=>search.includes("Die"))){
                    if(anim.find(search=>search.name.includes("Start"))) curranimlist[keys].push("Start")
                }
                for(i=0;i<curranimlist[keys].length;i++){
                    var filterarray = [
                        "Pre",
                        "Begin",
                        "Start",
                        "Idle",
                        "Loop",
                        "End",
                        "Die"
                    ]
                    var iscomp = true
                    if (curranimlist[keys].length>=2&&(curranimlist[keys][i].includes("Loop")||curranimlist[keys][i].includes("Idle"))&&!curranimlist[keys][i].includes("End")) iscomp = false
                    else{
                        iscomp = false
                        filterarray.forEach(element => {
                            if(curranimlist[keys][i].includes(element)) iscomp = true
                        });
                    }
                    if(!iscomp){
                        // console.log(curranimlist[keys][i])
                        var currvariable = anim.find(search=> search.name == curranimlist[keys][i])
                        // console.log(currvariable)
                        // console.log("Got "+ Math.round(8/currvariable.duration))
                        if(curranimlist[keys][i].includes("Idle")){
                            if(Math.round(3/currvariable.duration)>3)curranimlist[keys][i] = [curranimlist[keys][i],Math.round(3/currvariable.duration)]
                        }else if(currvariable.duration!=0){
                            curranimlist[keys][i] = [curranimlist[keys][i],Math.round(8/currvariable.duration)]
                        }

                    }
                }
            });


        }
        console.log(curranimlist)
        return curranimlist
    }

    function GetAnimationIndex(anim,name){

        return anim.map(function(e) { return e.name; }).indexOf(name)
    }


    function ZoomChibi(el){

        if (el==0) el = {value:0}
        var minscale = 0.5
        var maxscale = 2
        var mintop = 0
        var maxtop =-400

        // top:${-hei/2+150}px;left:-${wid/2-150}px
        // var zoomvalue = `${el.value}`
        var currscale = minscale + (maxscale*parseFloat(el.value)/100)
        var currtop = ((maxtop-mintop)*parseFloat(el.value)/100)
        // var currtop2 = mintop+((maxtop-mintop/2)*parseFloat(el.value)/100)

        // console.log(currtop)
        chibiscale=[currscale,currtop]
        $("#spine-widget").css("transform",`scale(${currscale})`)
        $("#spine-widget").css("top",`${(-hei/2+150)+currtop}px`)
        $("#spine-widget-token").css("transform",`scale(${currscale})`)
        $("#spine-widget-token").css("top",`${-hei/2+100 +currtop}px`)
    }

    function getUrlVars() {
        return new URL(window.location.href).searchParams;
    }



