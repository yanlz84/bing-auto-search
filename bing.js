// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.282
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
var default_search_words = ["总书记的这六天", "00后女钢筋工每天工地干10小时赚320", "顶尖华裔数学家被迫在美筹款", "育儿补贴申领正式全面开放", "河南贾湖遗址发现8000多年前木棺", "法国政府“垮台” 总理将辞职", "特朗普上诉失败 需赔女方8330万美元", "博主“农村细妹”突发脑溢血去世", "美国防部更名战争部 解放军报发文", "人民日报谈“禁带电话手表到学校”", "美股收盘中概股收涨 百度涨超6%", "“新疆和田开挖地铁”系谣言", "美国宣布制裁东南亚诈骗集团", "西藏一垃圾站30多只熊集体觅食", "为什么微信上那么多人住在安道尔", "沈阳一学校成立“沐浴学院”", "中国最重要的五大城市群 定了", "女子高铁上脱鞋 举起双脚做拉伸", "河南人为啥这么会开超市", "山姆们卖爆了 代工厂们赚麻了", "俄外长在普京访华住所问：拉布布在哪", "许凯方回应被曝聚众赌博", "男子胃癌晚期发现10岁女儿非亲生", "女子20元彩票刮中100万激动尖叫", "特朗普服用淡蓝色药片引发热议", "A股剧震 后市怎么走", "居民多月水费都是49.93元 公司：诬告", "国家安全部：某境外组织长期对华渗透", "吉大两名新生同名同日生来自同省份", "藏马熊频繁出入客户订特制门抵御", "家长投诉小学二年级1周仅1节英语课", "牛弹琴：法国的大麻烦来了", "奥运冠军吴敏霞解锁新身份", "新华社谈如何遏制农村高额彩礼", "黑龙江一地现长条滚筒状“怪云”", "大学军训“反恐大战”堪比大片", "中方回应美国务卿鲁比奥涉华声明", "韩国将尼帕病毒感染列为一级传染病", "36氪收涨92.75% 盘中多次触发熔断", "广东汕头一公路雨后满是白色泡沫", "法国一麻醉师为“炫技”投毒 致12死", "租房新规要来了 房东不能随意扣押金", "男子开车遭陌生人持刀捅伤致死", "千所中小学齐行敬师礼", "乌克兰女子在美遭刺喉 特朗普称可怕", "苑举正给阅兵观礼包贴上“封条”", "爸爸掏耳朵被孩子撞到致耳膜脱落", "警方通报乘客在网约车内喊“救命”", "女飞行员：若有人敢来挑衅 那就试试", "网友反映乌江开阳段成“垃圾江”", "iPhone 17电池容量曝光 美版更大"]

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
