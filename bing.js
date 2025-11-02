// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.391
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
var default_search_words = ["中韩元首会谈有这些亮点", "12岁女孩做外贸3个月卖了10万", "俄飞行员：要把“中国战机”打包带走", "神二十一有接力更有突破", "美方：美军机连续坠入南海并非巧合", "卢浮宫失窃珠宝现身黑市", "杨国福客服回应1斤豆芽卖28.8元", "全红婵训练场再现“水花消失术”", "超市卖20元一只的烤鸡 能放心吃吗", "“0号火炬手” 是它！", "化学老师出身 她凭啥成中国女首富", "女航天员回地球后禁止生育系谣言", "吉林女子驾车不慎撞死一头黑熊", "小区楼栋深夜发生沉降 当地通报", "温峥嵘同时间出现在3个直播间", "00后小伙用无人机吊运竹子：月赚4万", "对天发誓算证据吗 法院判了", "通背拳传人回应扇耳光大赛被扇晕", "12306购票页面出现“宠”字是咋回事", "吉林一号回应俯瞰台湾：想拍就能够拍", "TES不敌T1止步S15四强", "男子夜钓被当猎物遭枪击 4人被控制", "翁青雅采访朱珠被批没礼貌", "斗牛比赛2头水牛突然冲向人群", "诗人圣野逝世 作品是许多人集体回忆", "苏超决赛后6万球迷丝滑离场", "“苏超”冠军奖杯是金的吗？答案来了", "郑丽文：国民党要拨乱反正", "俄罗斯将乌克兰新总理列入制裁名单", "深铁拟向万科提供不超220亿借款", "王道席任湖南省委常委", "女子深陷骗局 民警竟被气到“报警”", "安德鲁王子被曝曾4天招40名性工作者", "伊朗总统：伊朗将重建核设施", "帝王专业户郑国霖：当景区NPC不丢脸", "甘肃一地多人凌晨在河道淘金", "台军新兵入伍竟然还组“家长群”", "小区因千万欠费3年未供暖 多方回应", "下周开启天气“大乱斗”模式", "吃饭和看病问题沦为美党争筹码", "12306服务上新：宠物可无人陪护托运", "男子驾车失联 疑进入罗布泊无人区", "落日熔金余霞成绮！北京现绝美晚霞", "上海地铁回应老人强行坐女生腿上", "泰州球员把苏超冠军献给天上的爸爸", "洪秀柱谈郑丽文上任：她会游刃有余", "以军突袭约旦河西岸一城市", "一张“美钞”值百亿？警方刑拘20多人", "全红婵陈芋汐各携手新搭档出战", "曝叙利亚政权领导人将与特朗普会晤", "墨西哥一商店爆炸致23人死亡"]

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
