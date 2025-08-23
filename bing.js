// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.249
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
var default_search_words = ["习近平总书记西藏行", "小伙16岁高考 17岁参加阅兵", "男子去世存款剩7块5：留满屋赝品古董", "奏响阅兵序曲 展示中国排面", "“何同学”海外走红 年收入或超千万", "《生万物》反派引反感 扮演者被骂破防", "净网：山西网警首次收网抓获近百人", "卢卡申科斥责泽连斯基：中国不欠你的", "大大大鸡枞菌大大大", "陈龙：哪个景区需要演员找我", "机器人铁蛋正面刚 锦州烧烤迎战", "医保新政下退休人员每月返500？假", "裸睡被看光女子患抑郁 丈夫追责公寓", "女童感染“食脑虫” 抢救60天后去世", "最低工资迎来“普调”", "阅兵当天 他将高高升起五星红旗", "国务院安委会挂牌督办黄河特大桥事故", "刘烨儿子诺一被偶遇 身高至少1米8", "小学老师被调去教高中：压力很大", "格斗女中医：感觉让全中国都失望了", "两人被抓 看到这种盒子立即报警", "10元车费乘客误付14万余元 司机报警", "男子经常听到楼上怪声 物业却称没人", "老人29年前被搭售老农保：仅能退200", "尾号“9999999”手机号0人出价流拍", "乔杉官宣老婆怀三胎", "11岁抗癌女孩张佳萱离世", "女子为省5块钱肩膀硬扛70公斤道闸", "胖东来新店本科保安保洁岗位已报满", "丁真被人打电话骂后回复：你满意了吗", "全网刷屏的“13元退款”后续来了", "柬埔寨国王和太后抵京", "普京访问了消失在地图上的神秘核城", "林诗栋黄友政男双亚军", "台湾8·23大罢免投票：无一提案通过", "董璇老公回应二胎争议：被吐槽下也好", "男子为争抚养权 连捅前妻闺蜜三刀", "现在开进口车只剩下面子了吗", "80元门票玩三天 中式迪士尼爆火", "“1小时涨几万” 如此票选校服无意义", "暴雨、大暴雨、台风来了", "这辆网约车少了一个座", "男子娶3个残障老婆？律师解读", "小学老师被调去教高中 教育局回应", "乌克兰：不会将土地拱手让人", "英国女子恋爱8个月分手跳伞自杀", "孩子书包刮到门禁杆被索赔1600元", "特朗普向莫迪释放重要信号", "老人将遗产留“干儿子” 法院：无效", "容祖儿演唱会从红馆开到县城校操场", "看广告才能开宿舍门？高校回应"]

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
