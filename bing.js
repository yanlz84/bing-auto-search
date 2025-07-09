// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.159
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
var default_search_words = ["一场精神的洗礼", "7月9日将成有史以来最短一天", "外交部回应冯德莱恩对中国提三要求", "这场发布会 中国人的成就感拉满", "相声演员杨少华去世 享年94岁", "杨少华上午还被推着参加剪彩", "暴恐音视频危害大 不看不存不转发", "高考575分被父母拒之门外合理吗", "几块钱冰饮背后藏着夏天最暴利生意", "英皇欠债166亿港元 旗下有众多艺人", "中方回应“用激光瞄准德国飞机”", "广州巨型哆啦A梦被热炸了？不实", "杨少华曾卖房借钱给儿子买古玩", "国家卫健委叫停阿尔茨海默病手术", "李金斗：杨少华午休时安详辞世", "杨少华相关账号中午还在带货", "上海地铁回应便衣当场抓捕猥亵男子", "杨少华曾为相声大师马三立捧哏", "男子称妻子出轨干部 讨说法反被打", "胡塞武装公布魔法海洋号被击沉全程", "石家庄暴雨 街道成河", "女子称孕期摆烂丈夫是副处 官方通报", "中方回应“特朗普就中美关系表态”", "餐馆回应杨少华去世上午参加剪彩", "《正当防卫》中丈夫家暴被妻子7刀反杀", "尖子生沉迷手机高考失常被扫地出门", "受贿2.29亿 窦万贵被判死缓", "杨少华一生留下众多经典作品", "女子地址被冒用点外卖？律师解读", "外交部回应美方限制中国公民买农田", "网友曝王俊凯曾挂十六科", "罗家英患癌放弃化疗后继续工作", "女足姚伟远射破门", "俄原交通部长自杀细节疑曝光", "暴雨致重庆多高校被淹 寝室变泳池", "黄渤高情商回复陈佩斯 顺便cue沈腾", "意大利一男子被吸入飞机引擎身亡", "云南现80公斤巨无霸“菌王”", "现在许多年轻人选择“无证婚姻”", "暑期去收集中国限量版地貌", "印尼一农夫被8米蟒蛇吞腹中死亡", "特朗普索要100亿美元驻韩军费", "青岛58岁卖玉米大姨回应跳海救人", "杨少华儿子杨议演出已暂停", "谈及普京 特朗普飙了脏话", "男子理发店充430万难退费 当地回应", "男子着急上班 3巴掌扇掉电梯门获刑", "大使馆：在韩中国公民加强安全防范", "周杰伦5小时涨粉500万", "官方回应田栩宁私生粉硬闯头等舱", "印度空军一架战机坠毁"]

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
