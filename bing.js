// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.79
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
var default_search_words = ["五千年的文明 要尊重也要弘扬", "美国对中国产大飞机动手了", "马克龙被打脸后说了啥 唇语专家破解", "端午将至 民俗体验游热度持续上升", "62岁俞敏洪骑行摔倒受伤：犯困睡着了", "印度蒙古将举行联合军演", "董卿再拿话筒回归舞台", "尊界S800发布会", "花生壳里塞冰淇淋卖28一个", "比亚迪回应被指是“汽车圈恒大”", "罗予彤说梦中情姐是叶童", "生酮液断 这些减肥法真的安全吗", "祝绪丹发文秒删 随后称和公司无关", "断眉来了！单依纯还能三连冠吗", "商家为防六一退货潮出奇招", "5岁抗癌男孩去世 曾患肝母细胞瘤", "宝马5系裸车价最低跌至26万元", "曝国米若夺冠将在米兰举行大巴巡游", "黄多多近照曝光 美貌不输妈妈", "日本禁止家长为新生儿取非常规姓名", "河南卫视端午奇妙游", "孙俪唇下痣系因车祸玻璃碴致假性痣", "韦雪前夫打电话求复合", "于文文来送高考祝福啦", "悬疑短剧《破晓》定档5月31日", "中国首份“阳光地图”发布", "外交部回应特朗普计划扩大对台军售", "这些“牛奶”不仅浪费钱还没营养", "小伙长期腹泻体重暴跌确诊绿色癌症", "国防部回应“端午节前后军演”", "#卤鹅哥喊话晓华求爆改#", "卤鹅哥揭秘去美国给甲亢哥带的礼物", "中国驻美大使：大院铁幕只会自我孤立", "华南和长江中下游地区干旱基本缓解", "东北三省一区有效发明专利近20万件", "特朗普关税政策暂停又恢复意味什么", "中行原副行长张小东任新职", "王毅签署国际调解院公约", "十五运会U16女足赛今日开赛", "直击端午节前北京出行情况", "17岁学生登顶珠峰保送清华？学校回应", "卤鹅哥为赴美见甲亢哥苦学英语", "确定男女关系第二天 她就开始借钱", "《碟中谍8》阿汤哥水下戏几乎盲拍", "王俊凯：为国产动画配音是种荣幸", "唐山发生3.2级地震", "西藏登协回应17岁学生北坡登顶珠峰", "游客在新加坡酒店吃榴莲被罚千元", "夫妻离婚后均拒绝抚养网瘾儿子", "34年聘用职工被强制“自愿转保”", "新疆龙舟赛不掺一点水分"]

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
