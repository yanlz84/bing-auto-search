// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.31
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
var default_search_words = ["发挥国家发展规划战略导向作用", "山东滕州车祸致6死 肇事司机醉驾", "外交部谴责美方：赤裸裸的政治挑衅", "夏粮进入产量形成关键期", "旺仔牛奶广告男主角长大了", "刘强东回应“凑76个鸡蛋上大学”", "飞常准显示一航班遭劫持 国航回应", "游客意外拍下8岁男童走失前画面", "中欧全面取消交往限制", "掉入火锅小猫已离世", "好友证实许玮甯怀孕", "上海一女子阻挡高铁关门？假", "女子1分钟剥130个煮鸡蛋", "美财长：对中国145%关税无法长期维持", "多省份晒出五一旅游成绩单", "中方回应长和获准出售巴拿马以外港口", "赵心童夺冠奖金约483万", "男子月薪3000元借贷60万炒金", "默茨暂未能当选德国总理", "多家华住会酒店拒绝携导盲犬入住", "五一档电影日均票房1.5亿元", "贵州一社区有人拐带儿童？警方回应", "专家建议推广灵活休假制度", "章泽天带8岁女儿伦敦追星", "朱婷汪顺等获评国家级教练职称", "全红婵等1101名运动员拟保送本科", "在岸人民币日内涨近600点", "赵心童邀请女朋友上台", "呷哺呷哺“五一”营收增长18.85%", "美以对也门发动大规模空袭", "白敬亭潮牌店涉质量问题卫衣已下架", "身上的这种小红点可能是血管瘤", "于东来邀请质疑者考察胖东来", "年轻人开始租三金结婚", "遭高潮针配图女孩称曾被印壮阳药上", "中国仪仗队帅成外国军人打卡点", "颁奖现场女友贴心为赵心童整理头发", "美国教师写信骚扰五年级女生", "地坛公园回应该树非余华本人认养", "撇开白宫约“私聊”的不止这六个州", "男子称54岁父亲在医院输液后身亡", "永辉力挺胖东来", "外贸商品在上海卖爆 市民：真尽兴", "《刑警的日子》首播差评", "“鬼子专业户”到景区沉浸式演反派", "全球最大语音通信软件正式停止运营", "AI“大学生”骗了数百万美金", "赵心童曾因涉赌球禁赛 中国台协回应", "加拿大官员：美电影关税政策令人费解", "孙珍妮疑似被换角", "长城汽车魏建军力挺胖东来"]

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
