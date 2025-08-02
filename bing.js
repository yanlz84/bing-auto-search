// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.206
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
var default_search_words = ["建设世界一流军队", "奔驰“亮证姐”是否公职人员应公布", "武大复核图书馆案：迟来但毕竟来了", "“国补”继续！690亿元资金10月下达", "12306回应高铁车厢现“低人一等座”", "男孩错付车费轻生 司机否认不还钱", "女子跑步时发现沟里有头骨 警方回应", "特朗普：将两艘核潜艇部署至俄附近", "伊能静称秦昊很少回家", "多家奔驰4S店关闭 车主咋办", "警方通报男子遭奔驰司机亮证逼让路", "百万粉博主自杀离世？假", "男子公然破坏军婚被判六个月", "央视披露重大军事任务画面", "旺仔小乔被榜一大哥起诉 要求还80万", "黄宗泽称女朋友经常被妈妈骂走", "男子遭亮证逼让路 民警上门让删视频", "尼斯湖水怪再次被拍到", "李咏23岁女儿疑似官宣恋情", "男子发现有蛇后惊叫和蛇双双弹起", "女子报警硬刚清晨5点广场舞", "71岁陈佩斯回来了", "格力电器：已向公安机关报案", "黄子韬马伯骞用英文吵架", "细节披露 歼-10C“击落”隐身战机", "自动驾驶出车祸特斯拉被判赔2亿美元", "什么是华丽巨蚊", "商家回应2颗话梅128元", "782万大奖无人兑奖将作废", "覃海洋上演\"八道奇迹\"夺200蛙冠军", "一公司推出见手青可乐 5天卖7000瓶", "这个5亿播放的AI视频邪乎得平平无奇", "女子拒还军人彩礼16万 法院判了", "演员于娜称会全力以赴减肥", "男子称遭奔驰司机“亮证”逼迫让路", "拼多多被判赔米哈游100万元", "蜜雪冰城柠檬水被投诉 市监局回应", "高盛在铜暴跌前一天告诉客户做多铜", "FBI局长发表涉华言论 外交部回应", "吉利汽车集团7月销量23.7万辆", "信息支援部队演练画面首次曝光", "《歌手2025》总决赛名单出炉", "中方就游客在日遇袭提出严正交涉", "《南京照相馆》预测票房已超42亿元", "太湖发生2025年第1号洪水", "泽连斯基：愿以最快速度推进实现和平", "台名嘴：解放军的黑科技太高明", "尊湃剽窃华为芯片技术遭重罚", "又被特朗普毒打 印度做错了什么", "俄乌释放谈判积极信号 美当头泼冷水", "韩国股市突然暴跌"]

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
