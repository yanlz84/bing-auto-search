// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.5
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
var default_search_words = ["习近平2025年东南亚之行全纪录", "外交部：打奉陪到底 谈大门敞开", "特朗普称或“大幅降低”对华关税", "神舟二十号航天员乘组确定", "媒体批董明珠“间谍言论”背离常识", "40岁男子应酬喝酒后独自在酒店猝死", "特朗普认怂了？", "谁给那英报的名", "走红听障女生背后的MCN机构曝光", "姚安娜现身上海车展", "中方回应白宫称中美谈判取得进展", "新疆5A级景区门票全免？假", "杨紫韩东君新剧守护文化瑰宝", "两国总统同晚抵达北京", "美学者呼吁尽快将帛书文物归还中国", "王嘉尔泰国节目聊中文水很深的意思", "特斯拉第一季度净利润同比下降71%", "7岁女孩因被忽略视力骤降至0.2", "石凯回应出轨传闻", "乒协新主席王励勤：为奥运6金定战略", "马龙说不会办退役告别会", "巴拿马大学谴责美干涉运河事务", "“田哥艳姐”被查", "男子喝热水养生20年查出舌癌", "邱贻可分享与孙颖莎刘国梁合影", "沈腾林允的绯闻传了3年", "刘国梁成在任时间最短乒协主席", "广西持续半年干旱后 多地迎来及时雨", "女子遭家暴驾车逃跑致夫身亡获刑", "刘国梁曾说找不到理由折腾王励勤", "孩子眼中的安全世界是什么样子", "商户往猪肉丸里加硼砂售4000斤获刑", "子宫内膜癌发病呈年轻化趋势", "游客买瓜起争执 170克手机称出340克", "白宫称与中国达成贸易协议进展顺利", "柯洁遭争议判罚后 中国放弃参加LG杯", "马龙：未来更关注梯队建设", "#仅退款为何会全面取消#", "中国男子在泰遭袭 悬赏1000泰铢找人", "王曼昱发文感谢刘国梁", "马斯克：将继续推动降低关税", "于正：《临江仙》一定爆", "小鹏机器人IRON现身小鹏展台", "中纪委一日打四“虎”", "吉利银河战舰上海车展首发", "山西被虐死男孩生父希望凶手死刑", "李现打卡过的中虎跳峡已被封", "极氪9X上海车展正式亮相", "伊能静：秦昊和钟楚曦好配", "《蛮好的人生》评价两极分化", "京东回应刘强东登骑手排行榜第一"]

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
