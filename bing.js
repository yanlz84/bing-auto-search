// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.207
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
var default_search_words = ["天下并不太平 和平需要保卫", "义乌冰箱贴成爆款 工厂忙到停不下来", "外卖未平 超市大战或将再起", "山洪来临前什么征兆", "快递员母亲谈儿子弃北大选西湖大学", "《南京照相馆》进入年度票房榜前三", "北方省份已出现白纹伊蚊", "网警发维护防汛救灾网络秩序倡议书", "母女被溅了一身脏水 妈妈直接报警", "特斯拉因致命车祸被判赔超2亿美元", "《年轮》被指抄袭", "新疆阿勒泰7月底下大雪？当地回应", "32头牦牛被货车撞上 交警：死了16头", "剑桥大学毕业生患癌后拒绝化疗去世", "男子花87万办了300年健身卡", "美国男子在日本当街殴打中国初中生", "董璇张维伊因结账吵架", "44岁女演员于娜回应容貌变化过大", "乘龙卡车再发两张海报内涵理想", "女孩疑被高空坠物砸身亡男友发声", "女子造谣孔刘性骚扰被判6个月", "小伙痛风石破溃 一天狂饮5升饮料", "检察机关决定对张斌和柳国仁逮捕", "少林寺1500年的真实历史", "“我在厦大修圣旨”", "陪看赵心童vs凯伦威尔逊", "杭州六小龙全球火爆出圈", "徐帆辟谣与冯小刚离婚", "联合国官员现场“打脸”以色列", "原来真有“爆米花”这种花", "“苏超”担架队都有了赞助商", "男子用50公斤臂力器不慎被弹伤", "孙俪晒一家四口海边游玩照", "女子酒店喝出咸味矿泉水 市监局回应", "上海警方通报外国人阻止吸烟起纠纷", "直击苏超：镇江vs南通", "演员侯梦莎官宣生女", "印尼火山猛烈喷发 火山灰柱1.8万米", "辽宁一景区“洗手费”0.3元15秒", "司机卖惨索捐被拒 诅咒乘客得癌", "直击苏超：徐州vs扬州", "张宏伟跨省履新河南信阳市委书记", "覃海洋自编自导自演神剧本", "驻日本大使馆再次发布安全提醒", "香港女学生假扮内地公安诈骗被捕", "直击苏超：淮安vs苏州", "《南京照相馆》暑期档票房29省登顶", "餐饮店被举报出现“阴阳菜单”", "佛山新报告基孔肯雅热确诊病例333例", "“中国制造”C909即将首飞澳门", "汪顺时隔八年再获游泳世锦赛奖牌"]

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
