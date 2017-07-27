/**
 * Created by 明柯 on 2017/7/20.
 */

//============================全局变量定义==============================

//=====================预备区方框（li元素）定义====
var rightReadyNum;      //右边等待使用的数字图
var leftReadyNum;       //左边等待数字图

//=====================预备区右边方块的位置与大小定义
var rightLeft;          //右方块左偏移
var rightTop;           //右方块上偏移
var rightWidth;         //右方块宽度
var rightHeight;        //右方块高度

//=====================初始化一些标志位等=========
var maxNum = 1;       //当前最大的数
var totalScore = 0;   //总分
var imgFlag = 0;      //ul中的img的标志：1表示等待选择break的img；2表示等待选择copy的img
var noWait = true;    //是否等待的标志位
var imgShowTime = 600;//图片的显现时长
var isShowShareDiv = false; //是否显示分享div

//====================音频元素定义==============
var aMergeArray = [];//合并方块的音效数组：在多个数同时合并时循环调用几个音乐
var aMerge;         //合并方块
var blockBreak;     //方块爆裂
var copy;           //复制方块
var gameOver;       //游戏结束
var gameStart;      //游戏开始
var clickFunction;  //点击功能按钮
var putBlock;       //放置方块
var recreate;       //重新生成方块


//============================初始化与事件绑定=====================================
$(document).ready(function () {

    //初始化两个li并且添加初始化方块
    leftReadyNum = $(".right-second");
    rightReadyNum = $(".right-init");
    leftReadyNum.append(createNumPic());
    rightReadyNum.append(createNumPic());


    //显示两个预备区方块；初始化右边预备方块的位置与大小
    leftReadyNum.children(":first").show(imgShowTime);
    rightReadyNum.children(":first").show(imgShowTime);
    rightLeft = rightReadyNum.children(":first").offset().left;
    rightTop = rightReadyNum.children(":first").offset().top;
    rightWidth = rightReadyNum.children(":first").offset().width;
    rightHeight = rightReadyNum.children(":first").offset().height;


    //初始化音频元素
    aMerge = $(".aMerge-audio")[0];
    aMergeArray.push(aMerge);
    aMergeArray.push($(".aMerge1-audio")[0]);
    aMergeArray.push($(".aMerge2-audio")[0]);
    aMergeArray.push($(".aMerge3-audio")[0]);

    blockBreak = $(".blockBreak-audio")[0];
    copy = $(".copy-audio")[0];
    gameOver = $(".gameOver-audio")[0];
    gameStart = $(".gameStart-audio")[0];
    clickFunction = $(".clickFunction-audio")[0];
    putBlock = $(".putBlock-audio")[0];
    recreate = $(".recreate-audio")[0];
    //alert((window.location.href).substring(0,(window.location.href).indexOf("forward")+12)+$(".right-init").children(":first").attr("src"));


    //图片预加载
    //预加载图片
    preloadImg(['../img/1.png','../img/2.png','../img/3.png','../img/4.png','../img/5.png','../img/6.png',
        '../img/7.png','../img/8.png','../img/9.png','../img/10.png','../img/11.png','../img/12.png',
        '../img/13.png','../img/14.png','../img/15.png','../img/16.png'
    ]);  //参数是一个url数组



    //为所有的li绑定事件
    $("li").click(liClick);

    //初始化显示总分
    $(".score").html(totalScore);

    //播放开始游戏的音乐
    useAudio(gameStart);

    //设置分享按钮位置，靠右
    $(".share-a").css({"left":(document.body.clientWidth)-60});





    //==========================截图保存事件========================
    $(".create-button").click(function () {
        var img = getSnapshoot($(".play-div"));
        $(".create-img").html(img);
        $(".create-img").show(500);
        if (isShowShareDiv) {
            $(".share-div").fadeOut(500);
            isShowShareDiv = false;
        } else {
            $(".share-div").fadeIn(500);
            isShowShareDiv = true;
        }
        //qqZone();
    });

    //==========================截图界面back按钮事件==================
    $(".back-button").click(function () {
        $(".create-img").fadeOut("slow");
        $("#lastImg").fadeOut("slow");
    });


    //==========================分享连接的事件========================
    $(".share-a").click(function () {
        if (isShowShareDiv) {
            $(".share-div").fadeOut(500);
            isShowShareDiv = false;
        } else {
            $(".share-div").fadeIn(500);
            isShowShareDiv = true;
        }
    });


    //==========================分享至社交网站========================
    $("#socialShare").socialShare({
        url: 'https://mymmyy.github.io',
        title: '听说高智商的人才能合到14，合到16的那是天才！',
        content: '进入我的主页，一起来玩吧！',
        pic: (window.location.href).substring(0, (window.location.href).indexOf("forward") + 12) + $("#lastImg").attr("src")
    });



    //===========================结束提示出现的重新游戏  和  取消事件=====
    $(".game-end").find("a").eq(0).click(function () {
        window.location.reload();
        $(".game-end").fadeOut(500);
    });


    $(".game-end").find("a").eq(1).click(function () {
        $(".game-end").fadeOut(500);
    });


    $(".reGame").click(function () {
        window.location.reload();
    })


    //==========================为底部三个功能绑定事件=================
    $(".play-end-div").find("img").click(function () {
        if ($(this).attr("src") == "img/break.png") {
            //破裂一个数字得点击事件
            //先判断是否可以执行
            if (!canExecute()) {
                return;
            }

            useAudio(clickFunction);                        //点击了功能
            $("ul img").css({"transform": "rotate(10deg)"});//可以被break的数字块旋转一下
            noWait = false;                                 //表示需要等待-使用在所有li的click事件中
            imgFlag = 1;                                    //表示img的执行功能为break
            $("ul img").bind("click", mainNumImgClick);     //为所有可以被操作的数字块绑定事件

            //只有一次使用机会，使用完毕解除功能
            unloadClickAndMouseEvent(this);

        } else if ($(this).attr("src") == "img/copy.png") {
            //复制事件
            //先判断是否可以执行
            if (!canExecute()) {
                return;
            }

            useAudio(clickFunction);                        //点击了功能
            $("ul img").css({"transform": "rotate(10deg)"});//可以被copy的数字块旋转一下
            noWait = false;                                 //表示需要等待-次---使用在所有li的click事件中
            imgFlag = 2;                                    //执行标志位设置为2，表示执行copy
            $("ul img").bind("click", mainNumImgClick);     //为所有可以被操作的数字块绑定事件

            //只有一次使用机会，使用完毕解除功能
            unloadClickAndMouseEvent(this);


        } else if ($(this).attr("src") == "img/recreate.png") {

            //先判断是否可以执行
            if (!canExecute()) {
                return;
            }

            useAudio(recreate);                             //点击了功能
            //重新产生两个预备数:先移除现有的两个，再重新生成
            leftReadyNum.children(":first").remove();
            rightReadyNum.children(":first").remove();

            leftReadyNum.append(createNumPic());
            rightReadyNum.append(createNumPic());
            leftReadyNum.children(":first").show(imgShowTime);
            rightReadyNum.children(":first").show(imgShowTime);

            //只有一次使用机会，使用完毕解除功能
            unloadClickAndMouseEvent(this);

        }
    });//三功能事件完





    //====================底部三个功能效果事件============================
    $(".play-end-div").find("img").mouseenter(function () {
        funMouseOn(this);
    });

    $(".play-end-div").find("img").mouseleave(function () {
        funMouseOff(this);
    })


});

//====================================================函数定义===================================================




//额外功能是否可以执行
function canExecute() {
    var allUlImg = $("ul img").length;
    if (allUlImg == 0 || allUlImg >= 16) {
        return false;                 //没有数字快就不使用该功能
    }
    return true;
}





//触发三功能后的接下来等待触发的事件（选择img进行break或copy），并根据执行标志设置执行内容
function mainNumImgClick() {

    if (imgFlag == 1) {
        /*表示等待选择执行break的img*/
        useAudio(blockBreak);                           //播放移除音乐
        this.remove();                                  //先移除该img
        $("ul img").css({"transform": "rotate(0deg)"}); //把旋转的角度旋转回来
        imgFlag = 0;                                    //执行完毕标志位复位

    } else if (imgFlag == 2) {
        /*表示等待选择执行copy的img*/

        useAudio(copy);                                 //播放复制音乐
        var newImg = $(this).clone();                   //克隆当前需要复制的img
        newImg.css({"transform": "rotate(0deg)"});      //把新添加的数字快方向摆正，等待move然后append
        numMove(newImg, rightTop, rightLeft, function () {
            rightReadyNum.children(":first").remove();  //回调函数中进行移除原来的预备数字
        });
        rightReadyNum.append(newImg);                   //预备的位置添加新复制的数字块
        noUse = false;                                  //表示使用成功
        $("ul img").css({"transform": "rotate(0deg)"}); //把旋转的角度旋转回来
        imgFlag = 0;                                    //执行完毕标志位复位

    }

}




//每个li得click事件函数，便于解绑与重新绑定
function liClick() {
    //先判断是否等待
    if (!noWait) {
        // noWait = true;      //此次等待，下次则不用等待，所以把标志位修改回来
        if (imgFlag == 0) {
            noWait = true;
        }
        return;             //需要等待则结束本次事件
    }

    //若存在就不允许再添加
    if ($(this).find("img").length > 0) {
        return false;
    }


    numMove(rightReadyNum.children(":first"), this.offsetTop, this.offsetLeft,function () {
        useAudio(putBlock);     //播放放置方块音乐

    });
    $(this).append(rightReadyNum.children(":first"));
    readyMove();            //左边的数字右移动准备使用，并且生成新的准备数

    removeSimilarAndCreateBiger(this);

}




//功能块只有一次使用机会，使用后不再接受点击事件
function unloadClickAndMouseEvent(currentImg) {
    $(currentImg).css({"opacity": 0.5});
    $(currentImg).unbind("click");
    $(currentImg).unbind("mouseenter");
    funMouseOff(currentImg);            //先归位再解绑
    $(currentImg).unbind("mouseleave");
}





//底部功能模块鼠标移上函数
function funMouseOn(curElement) {

    var thisEle = $(curElement);
    var h = thisEle.height();
    thisEle.height(h + 5);
    var w = thisEle.width();
    thisEle.width(w + 5);
    $(thisEle).css({"cursor": "pointer"});
}




//底部功能模块鼠标离开函数
function funMouseOff(curElement) {
    var thisEle = $(curElement);
    var h = thisEle.height();
    thisEle.height(h - 5);
    var w = thisEle.width();
    thisEle.width(w - 5);
    // $(thisEle).css({"padding":"0px"});

}





//加分数
function addScore(score) {
    totalScore += score;
    $(".score").html(totalScore);
}




//移除周围相同的数，并产生一个大于一的数
function removeSimilarAndCreateBiger(currentNum) {
    var currentNumImg = $(currentNum).find("img");
    //做非空校验，若为空就不继续执行-----存在鼠标点击过快，而方块还未预备好
    if(currentNumImg.attr("src") == null || currentNumImg.attr("src") == ""){
        return;
    }

    addScore(2);                                              //可以运行就可以加分

    var num = parseInt(currentNumImg.attr("src").substring(4,
        parseInt(currentNumImg.attr("src").indexOf("."))));  //解析成数字
    var thisIndex = $(currentNum).index();                   //获得是第几个li
    var allMerge = findAllMergeNum(thisIndex, num);
    if (allMerge.length > 0) {
        //先计算分数，再原有数值分上：一个合并乘2，2个合并乘4，3个合并乘6
        addScore(getImgNum($(currentNum)) * (allMerge.length)       //原有相加分数，在此基础之上乘幂数
            * (allMerge.length) * 2
        );

        var curImg = $(allMerge.shift()).children(":first");
        runMerge(curImg, currentNum, allMerge);

    }else {
        //如果没有需要合并的方块再扫描是否已经结束游戏
        if (isGameover()) {
            useAudio(gameOver);         //播放结束音频
            $(".game-end").fadeIn(200);
            //alert("游戏结束！你本局获得分数为：" + totalScore +"  刷新页面即可重新开始游戏");
        }

    }

}





//方块合并运行=====================================
function runMerge(curImg, currentNum, allMerge) {

    numMove(curImg, currentNum.offsetTop, currentNum.offsetLeft, function () {
        curImg.remove();        //通过回调函数移除当前移动的元素--同步函数的执行顺序

        useAudio(aMerge);       //合并了就播放合并声音

        if (allMerge.length == 0) {
            //移动完毕之后延时执行图片数加一切换，并且再次查看周围的情况是否需要合并
            var newNum = (getImgNum($(currentNum)) + 1);
            if (newNum > maxNum) {
                maxNum = newNum;
                //最大数超越，就加10分
                addScore(10);
            }
            var newSrc = "img/" + newNum + ".png";
            $(currentNum).children('img').attr("src", newSrc);


            removeSimilarAndCreateBiger(currentNum);
        } else {
            curImg = $(allMerge.shift()).children(":first");
            runMerge(curImg, currentNum, allMerge);
        }
    });
}





//生成数字图片，返回一个随机数字图片节点
function createNumPic(initNum) {
    var thisNum;
    if (initNum != null) {
        thisNum = initNum
    } else {
        //如果最大的数大于9，就产生1-9的数，不往上产生比9大的数，否则太简单
        if (maxNum <= 9) {
            thisNum = (Math.random() * (maxNum - 1)) + 1;
        } else {
            thisNum = (Math.random() * (9 - 1)) + 1;
        }

        thisNum = Math.round(thisNum);
    }

    // var thisImg = $("<img src='img/" + thisNum + ".png' alt='" + thisNum + "'/>");
    return $("<img src='img/" + thisNum + ".png' alt='" + thisNum + "'/>");

}





//num方块移动到指定位置
function numMove(current, moveTOTop, moveToLeft, callback) {
    current.animate({left: moveToLeft, top: moveTOTop}, 100, "linear", callback);
    return current;             //仍然返回当前移动的节点
}





//准备好的数字块自动移到右边
function readyMove() {
    rightReadyNum.children(":first").remove();
    leftReadyNum.children(":first").animate({
        left: rightLeft, top: rightTop,
        width: rightWidth, height: rightHeight
    }, "fast", "linear", function () {
        var thisClone = leftReadyNum.children(":first").clone();
        rightReadyNum.append(thisClone);
        leftReadyNum.children(":first").remove();

        //然后生成左边的节点
        leftReadyNum.append(createNumPic());
        leftReadyNum.children(":first").show(imgShowTime);
    });
}






//找到需要合并的img所属的li
function findAllMergeNum(index, currentNum) {
    var a = [];        //准备一个数组
    var all = $("li");

    var line = 6;        //一行有6个img
    var plusNum = 1;
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
            if (getImgNum(all.eq(index + line + plusNum)) == currentNum) {
                a.push(all.eq(index + line + plusNum));
            }
            plusNum--;
        }
        line = -6;
        plusNum = 1;
    }

    //还剩左右两边的li进行判断
    if (getImgNum(all.eq(index - 1)) == currentNum) {
        a.push(all.eq(index - 1));
    }
    if (getImgNum(all.eq(index + 1)) == currentNum) {
        a.push(all.eq(index + 1));
    }

    return a;
}





//获得图片的数值.有图片则返回图片数值，没有则返回-1
function getImgNum(liNode) {
    if (liNode.find("img").length > 0) {
        var liImg = liNode.find("img");
        return parseInt(liImg.attr("src").substring(4,
            parseInt(liImg.attr("src").indexOf("."))));
    }
    else
        return -1;
}





//判断游戏是否结束
function isGameover() {
    if ($(".main").find("img").length < 16) {
        return false;
    }
    return true;
}






var mergeIndex = 0;         //合并方块音频序号
//控制音频播放与停止
function useAudio(currentAudio) {

    if ($(currentAudio).attr("src") == "au/aMerge.mp3") {
        if (mergeIndex > aMergeArray.length - 1) {
            mergeIndex = 0;
        }
        aMergeArray[mergeIndex++].play();
    } else {
        currentAudio.play();
    }

}






//获得截图；node:需要截图的节点
function getSnapshoot(node) {

    //使用html2canvas提供的封装进行截图
    html2canvas(node, {
        onrendered: function (canvas) {
            var url = canvas.toDataURL();
            var img = new Image();
            img.src = url;
            $("#lastImg").attr("src", url);
            $("#lastImg").show(1000);

            if(isIE()){
                alert("您使用的是IE内核的浏览器，不支持保存文件，您可以通过其他方式进行截图保存，或者更换FireFox、chrome、Opera进行游戏");
            }else {
                //以下代码为下载此图片功能
                var triggerDownload = $("<a>").attr("href", url).attr("download", "img.png").appendTo("body");
                triggerDownload[0].click();
                triggerDownload.remove();
                console.log("shiyong");
            }

            sh



            return $("#lastImg");
        }
    });
}



//实现图片的预加载
function preloadImg(srcArr){
    console.log("yuchuli");
    if(srcArr instanceof Array){
        for(var i=0; i<srcArr.length; i++){
            var oImg = new Image();
            oImg.src = srcArr[i];
        }
    }
}




//判断是否是IE
function isIE(){
    if (!!window.ActiveXObject || "ActiveXObject" in window){
        return true;
    }
    return false;
}





//======================以下功能未完成代码================================


function getSnapshootUrl(node) {
    var thisUrl;
    html2canvas(node, {
        onrendered: function (canvas) {
            thisUrl = canvas.toDataURL();


            var _url = "https://mymmyy.github.io";
            var _showcount = 0;
            var _desc = "nihao";
            var _title = "mymmyy";
            var _site = "";
            var _width = "600px";
            var _height = "800px";
            var _summary = "";
            var _pic = thisUrl;
            var _shareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?';
            _shareUrl += 'url=' + encodeURIComponent(_url || document.location);   //参数url设置分享的内容链接|默认当前页location
            _shareUrl += '&showcount=' + _showcount || 0;      //参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
            _shareUrl += '&desc=' + encodeURIComponent(_desc || '分享的描述');    //参数desc设置分享的描述，可选参数
            //_shareUrl += '&summary=' + encodeURIComponent(_summary||'分享摘要');    //参数summary设置分享摘要，可选参数
            _shareUrl += '&title=' + encodeURIComponent(_title || document.title);    //参数title设置分享标题，可选参数
            //_shareUrl += '&site=' + encodeURIComponent(_site||'');   //参数site设置分享来源，可选参数
            _shareUrl += '&pics=' + encodeURIComponent(_pic || '');   //参数pics设置分享图片的路径，多张图片以＂|＂隔开，可选参数
            window.open(_shareUrl, 'width=' + _width + ',height=' + _height + ',top=' + (screen.height - _height) / 2 + ',left=' + (screen.width - _width) / 2 + ',toolbar=no,menubar=no,scrollbars=no,resizable=1,location=no,status=0');
        }
    });


    return thisUrl;

}

function qqZone() {
    getSnapshootUrl($(".play-div"));
    /* var _url = "https://mymmyy.github.io";
     var _showcount = 0;
     var _desc = "nihao";
     var _title = "mymmyy";
     var _site = "";
     var _width = "600px";
     var _height = "800px";
     var _summary = "";
     alert(getSnapshootUrl($(".play-div")));
     var _pic = getSnapshootUrl($(".play-div"));
     alert(_pic);
     var _shareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?';
     _shareUrl += 'url=' + encodeURIComponent(_url||document.location);   //参数url设置分享的内容链接|默认当前页location
     _shareUrl += '&showcount=' + _showcount||0;      //参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
     _shareUrl += '&desc=' + encodeURIComponent(_desc||'分享的描述');    //参数desc设置分享的描述，可选参数
     //_shareUrl += '&summary=' + encodeURIComponent(_summary||'分享摘要');    //参数summary设置分享摘要，可选参数
     _shareUrl += '&title=' + encodeURIComponent(_title||document.title);    //参数title设置分享标题，可选参数
     //_shareUrl += '&site=' + encodeURIComponent(_site||'');   //参数site设置分享来源，可选参数
     _shareUrl += '&pics=' + encodeURIComponent(_pic||'');   //参数pics设置分享图片的路径，多张图片以＂|＂隔开，可选参数
     window.open(_shareUrl,'width='+_width+',height='+_height+',top='+(screen.height-_height)/2+',left='+(screen.width-_width)/2+',toolbar=no,menubar=no,scrollbars=no,resizable=1,location=no,status=0');*/
}


