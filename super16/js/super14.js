/**
 * Created by 明柯 on 2017/7/20.
 */

//============================全局变量定义=======================
var rightReadyNum;      //最右边等待使用的数字图
var leftReadyNum;       //左边的数字图div

var rightLeft;
var rightTop;
var rightWidth;
var rightHeight;

var maxNum = 1;      //当前最大的数
var totalScore = 0;         //总分
var imgFlag = 0;      //ul中的img的标志：1表示等待选择break的img；2表示等待选择copy的img
var noWait = true;    //是否等待的标志位


//============================初始化与事件绑定====================
$(document).ready(function () {

    leftReadyNum = $(".right-second");
    rightReadyNum = $(".right-init");


    leftReadyNum.append(createNumPic());
    rightReadyNum.append(createNumPic());


    //****初始化两个待使用图片的位置


    leftReadyNum.children(":first").show(1000);
    rightReadyNum.children(":first").show(1000);
    rightLeft = rightReadyNum.children(":first").offset().left;
    rightTop = rightReadyNum.children(":first").offset().top;
    rightWidth = rightReadyNum.children(":first").offset().width;
    rightHeight = rightReadyNum.children(":first").offset().height;

    //显示总分
    $(".score").html(totalScore);


    /*****为li绑定事件******/
    $("li").click(liClick);


    //==========================为底部三个功能绑定事件=================
    $(".play-end-div").find("img").click(function () {
        if ($(this).attr("src") == "img/break.png") {
            //破裂一个数字得点击事件

            //先判断是否有显示的16个li中是否有img
            if ($("ul img").length == 0) {
                return;                 //没有数字快就不使用该功能
            }

            $("ul img").css({"transform": "rotate(10deg)"});//可以被break的数字块旋转一下
            noWait = false;                                 //表示需要等待-次---使用在所有li的click事件中
            imgFlag = 1;
            $("ul img").bind("click", mainNumImgClick);      //为所有可以被操作的数字块绑定事件

            //只有一次使用机会，使用完毕解除功能
            uploadClick(this);

        } else if ($(this).attr("src") == "img/copy.png") {
            //复制事件
            //先判断是否有显示的16个li中是否有img
            if ($("ul img").length == 0) {
                return;                 //没有数字快就不使用该功能
            }

            $("ul img").css({"transform": "rotate(10deg)"});//可以被copy的数字块旋转一下
            noWait = false;                                 //表示需要等待-次---使用在所有li的click事件中
            imgFlag = 2;                                    //执行标志位设置为2，表示执行copy
            $("ul img").bind("click", mainNumImgClick);      //为所有可以被操作的数字块绑定事件

            //只有一次使用机会，使用完毕解除功能
            uploadClick(this);


        } else if ($(this).attr("src") == "img/recreate.png") {
            //重新产生两个预备数:先移除现有的两个，再重新生成
            leftReadyNum.children(":first").remove();
            rightReadyNum.children(":first").remove();

            leftReadyNum.append(createNumPic());
            rightReadyNum.append(createNumPic());
            leftReadyNum.children(":first").show(1000);
            rightReadyNum.children(":first").show(1000);

            //只有一次使用机会，使用完毕解除功能
            uploadClick(this);


        }
    });//三功能事件完


});


//==========================触发三功能后的接下来等待触发的事件（选择img进行break或copy），并根据执行标志设置执行内容
function mainNumImgClick() {

    if (imgFlag == 1) {
        //表示等待选择执行break的img
        this.remove();                                  //先移除该img
        $("ul img").css({"transform": "rotate(0deg)"}); //把旋转的角度旋转回来
        imgFlag = 0;                                    //执行完毕标志位复位
    } else if (imgFlag == 2) {
        //表示等待选择执行copy的img
        var newImg = $(this).clone();                   //克隆当前需要复制的img
        newImg.css({"transform": "rotate(0deg)"});      //把新添加的数字快方向摆正，等待move然后append
        numMove(newImg, rightTop, rightLeft, function () {
            //回调函数中进行移除原来的预备数字
            rightReadyNum.children(":first").remove();
        });
        rightReadyNum.append(newImg);                   //预备的位置添加新复制的数字块

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

    numMove(rightReadyNum.children(":first"), this.offsetTop, this.offsetLeft);
    $(this).append(rightReadyNum.children(":first"));
    readyMove();            //左边的数字右移动准备使用，并且生成新的准备数

    //每走一步得2分
    removeSimilarAndCreateBiger(this);
    addScore(2);

     if (isGameover()) {
         alert("游戏结束！你本局获得分数为：" + totalScore);
    }
}

//============================函数定义============================

//=================功能块只有一次使用机会，使用后不再接受点击事件
function uploadClick(currentImg) {
    $(currentImg).css({"opacity": 0.5})
    $(currentImg).unbind("click");
}


//=================加分数===============================
function addScore(score) {
    totalScore += score;
    $(".score").html(totalScore);
}

//移除周围相同的数，并产生一个大于一的数
function removeSimilarAndCreateBiger(currentNum) {
    var currentNumImg = $(currentNum).find("img");
    var num = parseInt(currentNumImg.attr("src").substring(4,
        parseInt(currentNumImg.attr("src").indexOf("."))));  //解析成数字
    var thisIndex = $(currentNum).index();                                   //获得是第几个li
    var allMerge = findAllMergeNum(thisIndex, num);
    if (allMerge.length > 0) {
        //先计算分数，再原有数值分上：一个合并乘2，2个合并乘4，3个合并乘6
        addScore(getImgNum($(currentNum)) * (allMerge.length)       //原有相加分数，在此基础之上乘幂数
            * (allMerge.length) * 2
        );

        var curImg = $(allMerge.shift()).children(":first")
        run1(curImg, currentNum, allMerge);

    }
    
}


//====================合并运行=====================================
function run1(curImg, currentNum, allMerge) {

    numMove(curImg, currentNum.offsetTop, currentNum.offsetLeft, function () {
        curImg.remove();        //通过回调函数移除当前移动的元素--同步函数的执行顺序

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
            curImg = $(allMerge.shift()).children(":first")
            run1(curImg, currentNum, allMerge);
        }
    });
}


//===============生成数字图片，返回一个随机数字图片节点
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


//创建leftReadyNum的子节点
function createLeftReadyNum() {
    leftReadyNum.append(createNumPic());
}


//num节点移动到指定位置
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
        leftReadyNum.children(":first").show(1000);

    });
}

//找到需要合并的img所属的li
function findAllMergeNum(index, currentNum) {
    // alert(index+":"+currentNum);
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

