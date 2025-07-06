// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.152
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
var default_search_words = ["站在创造未来的源头上", "马斯克宣布“美国党”成立", "罗马仕深夜正式发布停工停产通知", "高温天气这几件事不宜做", "“全国经济最强镇”党委书记拟提拔", "让百万充电宝陷召回事件的源头是它", "北京老人接个电话后100万被转走", "全球博士生过剩", "前台开错房涉事女房客男友发声", "陈乔恩分享5天紧急瘦身法", "日本末日预言造成5600亿日元损失", "院士预测广东将有8级以上地震？假", "瞒着家人考北大男生：让妈妈拆通知书", "山东舰上歼15T为香港观众遮风挡雨", "老人欲用20万现金买购物卡被拦下", "杭州东站有人跳入股道被撞 官方通报", "伊朗最高领袖首次公开露面", "北京人要进化出鳃了", "3名初中生偷奔驰致严重车祸保险拒赔", "若塔葬礼上遗孀趴棺痛哭", "多方回应河南一乡道因高温爆裂拱起", "9人大巴黎2比0拜仁", "皇马3-2多特 晋级4强", "美国得州洪水死亡人数上升至32人", "南通2比1徐州再度登顶苏超榜首", "演员王梓薇买别墅了", "血铅异常幼儿确诊 疑似“毒源”曝光", "旅客突然跳入股道致列车晚点", "时隔57年 印度领导人访问阿根廷", "众星悼念演员雪妮去世", "女子吃冰激凌突发“脑结冰”", "苏超一场比赛诞生两项纪录", "WTT美国大满贯7日重点赛程发布", "违规收礼数额巨大 董莉莉被开除党籍", "幼儿血铅异常背后：有6岁孩子长白发", "俄莫斯科两机场再次暂停起降航班", "河南有水泥路热“炸”了", "舰载机之大大大大大一屏放不下", "加州马德雷山火蔓延超过320平方公里", "鹿晗全平台账号解封", "以军袭击加沙多地造成至少62人死亡", "上海首创外卖骑手“交通安全码”", "乌克兰：成功袭击俄罗斯军工综合体", "美国发生枪击事件已致2死7伤", "以决定派出代表团进行加沙停火谈判", "八个主要产油国决定8月继续增产", "伊朗与六国达成共识", "男子看到自己被悬赏后主动现身还钱", "李洪伟被“双开”", "男子儿时误吞7颗瓜子藏在脖子20年", "日媒：日本拟于明年试采南鸟岛稀土"]

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
