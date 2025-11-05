// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.397
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
var default_search_words = ["同世界各国分享发展机遇", "撞击神二十的空间碎片危害有多大", "新任干部炫耀公务员身份泄密被处分", "一起打卡进博会“黑科技”", "特斯拉撞死闯国道野猪 车主被判全责", "游客投诉点的馄饨上来抄手", "年度最大“超级月亮”来了", "王传君获东京电影节影帝", "拜登被拍到外出就餐 看起来格外虚弱", "一定要远离大车记住了吗", "国台办回应或全球通缉“台独”分子", "海关罚没物品“内部处理”不实", "女子不想叫“丽春” 多次改名被拒", "专家解读为何春节放9天", "王传君获东京影帝全程不笑被导演cue", "北京发布大雾黄色预警", "暴雪大暴雪要来了 多大的雪才算暴雪", "邵佳一为何能成国足新帅", "北方多地夜空现不明发光飞行物", "央视披露网红户晨风账号被封详情", "男子与堂哥合谋车祸撞死7岁儿子骗保", "巴西决定临时迁都", "外交部回应美财长称中国不可靠", "福建舰即将入列？三亚发布航行警告", "足协官宣：邵佳一任国足主教练", "本周广州离婚预约已约满？官方回应", "柴怼怼碰瓷“胖东来”案件详情披露", "黄金税收新规来了！变现要缴税吗", "邵佳一能带国足进世界杯吗", "张纪中被控职务侵占 涉事公司回应", "XXXL号月亮来了 最佳赏月时间请收", "张纪中回应被指控职务侵占：前妻诬告", "新华社评宝宝巴士APP现低俗广告", "来看超级月亮第一波美图", "哪里能看到年度最大“超级月亮”", "王传君感谢白百何和刘丹", "学生被强收7500元网课费？教育局介入", "醉驾男子车内酣睡 醒来发现在河中", "60秒直击今年最大“超级月亮”", "王楚钦樊振东男单同一半区", "开车门不能一推了之 如何避免开门杀", "能治十几种病？揭秘朋友圈“神药”", "邵佳一曾任国足梯队主帅和国足助教", "邵佳一曾说当国足主帅是梦想", "26人收购销售200多头病死牛被判刑", "七星山荒野求生挑战赛还剩18名选手", "台媒热议解放军攻击-21无人机", "涉对美出口管制管控 中方决定调整", "世界互联网大会乌镇峰会将举行", "国台办回应网友给“太空小鼠”取名", "以方：将在黄线内不设限制打击哈马斯"]

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
