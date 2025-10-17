// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.358
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
var default_search_words = ["“始终绷紧粮食安全这根弦”", "“竹裤架”突然翻红", "新西兰从韩国抢回造船订单塞给中国", "看中国如何守住每一粒米", "中方回应特朗普让中国停买俄石油", "曹德旺回应退休：我儿子也55岁了", "美国没收柬电诈头目150亿美元比特币", "每月攒一颗小金饰 00后“另类”淘金", "一对广东新人何以被中央文明办点赞", "郑州“炒八掺”爆火 店主体力不支", "韩国人成为柬埔寨电诈园区新猎物", "“云南鲁甸地震致多人伤亡”不实", "特朗普：可能在匈牙利与普京会面", "官方：对农村宴席桌数提出倡导性标准", "大牌设计“撞脸”长沙雅礼校服", "4岁女童失踪千人搜寻未果 家属发声", "美股三大股指齐收跌 金龙指数跌近1%", "河南培育出156.47克拉全球最大钻石", "客人在酒店随手一挂 事后被索赔16万", "警方通报网传新娘与摄影师事件", "“村长”李锐已从湖南卫视离职", "顾客卖出500克黄金1天赚近5万", "51岁何炅自曝：我现在特别痛苦", "今年金价已经创45次新高", "歌手黄小玫去世 上月露面无异样", "韩媒讽刺台军是“草莓兵”", "被追问“国会山骚乱” 佩洛西破防", "暴雨大暴雨要来了", "“玻璃大王”曹德旺卸任 交棒长子", "湖南邵阳深夜发生3.4级地震（塌陷）", "小猪逃跑狂奔 校方：已送回实验室", "商务部回应美方以100%新关税施压", "上海机场2名外国人躺卧霸占6个座", "缅北刘家：果敢老街东城大多是我地盘", "特朗普：普京说不喜欢我卖给乌导弹", "外交部回应美财长“锐评”中国官员", "济南一国考岗位报考人数比649:1", "中国海军83舰编队抵达泰国", "普特通话细节：俄方发起 时长2.5小时", "地球达到首个气候临界点意味什么", "部分地区日照时数已少到破纪录", "南航宣布本科生不写论文也能毕业", "蒋万安突访台南引发外界关注", "全国多地迎强降雨与大风天气", "4300美元！现货黄金再破整百关口", "加沙民众领取物资不再“毫无尊严”", "山东滨州百余学生呕吐腹泻 官方通报", "菲律宾群岛地区6.0级地震", "苹果正筹备推出搭载触控屏的Mac电脑", "胡塞武装证实其总参谋长加巴里身亡", "哈马斯和以就移交被扣押人员存分歧"]

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
