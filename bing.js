// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.299
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["抗战胜利80周年纪念活动总结会举行", "职工医保账户余额可以转账了", "月入2万的吃货 吃爆苍蝇馆子", "中央企业累计上缴税费超10万亿元", "旅客飞机上想起家中煮着鸡蛋没关火", "湖南富豪离婚后又给女儿塞超7亿元", "网警打掉侵犯公民个人信息犯罪团伙", "都“举白旗”了 菲律宾为何还否认", "1家5口登机前30分钟狂吃11斤榴莲", "欧盟宣布对以色列制裁措施", "全国第一辆小米SU7出租车投入运营", "当地辟谣男子因天价彩礼跳河", "福建一中学强制女生剪“斜面短发”", "女子拍闪电意外拍到不明黑影", "格力再送12名员工参军 董明珠发声", "丝瓜汤文学为何引起共鸣", "42岁相声演员修明炎去世 父母已不在", "男子重建仓房发现父亲生前藏的钱", "10天涨100亿 宇树科技朋友圈狂欢", "要求200万月薪的董事长已被免职", "65岁刘雪华新电影扮90岁老太", "“中产神裤”卖不动了", "“隐形战机不隐形啊 都看到了”", "美国网球选手吐槽中国菜后道歉", "《731》全球首映式观众不停抹泪", "北京大学副校长任羽中被查", "外交部对美方连发三个“停止”", "特斯拉“车顶维权”车主数据案胜诉", "月嫂粗暴拖拽婴儿画面曝光 宝妈回应", "任羽中系主动投案 曾是四川文科状元", "柯尔鸭身价从上万跌至几百元", "网红“小黑妮”结婚带货 直播间被封", "4岁女童洗澡时被哥哥电伤 父亲回应", "中国游客用嘴咬住落水女子头发救人", "来自5000年前的“表情包”", "狗狗走失200多天后自己跑回家", "美国施压后 日本暂不承认巴勒斯坦国", "男子钓上53斤大鱼绑在后备箱上嘚瑟", "女子误坠深井又遭蛇咬 54小时后获救", "多家蜜雪冰城柠檬水断货", "韩方授予4名中国海警荣誉称号", "“消失”的村镇银行", "特朗普终于打通了莫迪的电话", "近年来“最奇特”的美联储会议来了", "以军在加沙城行动最新画面公布", "捷豹路虎受网络攻击停产 员工休假", "女子敬业工作忘拉门 头撞门上被磕红", "钓鱼博主自发清理江面垃圾", "男子回应妈妈在书包上缝NIKE标", "第十二届北京香山论坛拉开序幕", "丁俊晖晋级英格兰公开赛16强"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
