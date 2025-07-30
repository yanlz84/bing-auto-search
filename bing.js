// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.200
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
var default_search_words = ["习近平对防汛救灾工作作出重要指示", "上海浦东计划避险转移11万人", "中美经贸会谈最新进展", "育儿补贴3600元背后的三重深意", "储户在银行存35万 取款时被清零了", "“成人安抚奶嘴”走红", "71岁成龙老花严重 拍戏看不清道具", "哀牢山发现7株“冥界之花”", "美开应答机运核武器 俄准备全面对抗", "成都地铁官方回应“防走光”设计", "酒企在啤酒中添加类似“伟哥”物质", "长江游船倒扣18人下落不明？谣言", "“茅台八仙之一”冯小宁被公开除名", "新疆有民宿涨到4000元一晚？当地回应", "台风“竹节草”在浙江舟山登陆", "泰军方称柬方再次违反停火协议", "河北网友家中发现白纹伊蚊", "足协纪委会原主任王小平获刑10年半", "公司浴室起火致26死 13人被提起公诉", "汽车停露天停车场 挡把被热化", "79岁狄龙谈到张国荣泪崩", "9旬孤老留500万遗产：仍在寻继承人", "孕妇遭有“电诈”前科亲戚诱骗失联", "江西一树林现大量被丢弃药品", "河北暴雨 女子发帖引网友共情", "90岁老人确诊乳腺癌 医生提醒", "新住持曾称“不评价少林寺商业化”", "QQ音乐回应张碧晨仍是《年轮》原唱", "演唱会偷情事件男主起诉Coldplay", "涉基孔肯雅热 多地疾控紧急提醒", "华为重回世界500强前100", "18人在河北承德避暑遭遇山洪", "男子患精神分裂刺死老太被判无期", "湖南一肠粉店米浆内掺硼砂被查", "堪察加东岸远海发生7.9级地震", "众明星捐款捐物驰援北京灾区", "日本多地发布海啸预警", "美国要从俄罗斯手中买岛？俄方回应", "上海海关截获47只辐纹陆龟", "400亿热钱 资本不再寻找下1个欧莱雅", "中央气象台发布暴雨橙色预警", "孙颖莎驰援京津冀洪涝灾区", "共享充电宝装后门 间谍窃密手段曝光", "美英乌计划替换泽连斯基？乌克兰回应", "“害怕这俩字 在脑海里就没有过”", "李成钢回应中美经贸会谈进展", "美国夏威夷发布海啸预警", "本次降水潮白河流域出现6个历史第一", "强降雨致河北35.6万人受灾", "女子卖劳力士收32万后银行卡被冻结", "日本百日咳持续蔓延 今年已超5万例"]

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
