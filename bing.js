// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.367
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
var default_search_words = ["领航中国式现代化 民生为大", "不用中考 十二年贯通式学校来了", "中方回应美威胁对华断供飞机零部件", "一图读懂十四五成就硬核知识点", "今年会出现极寒冷冬吗？最新研判", "西湖大学获重要突破：2个世界首次", "公安部公布10起整治谣言典型案例", "外交部回应特朗普称将于明年初访华", "女装店主不建议买300元以下羽绒服", "这是来自10名普通中国人的记忆", "阿迪达斯羽绒服竟是雪中飞代工的", "“趵突泉靠水泵才能喷涌”系谣言", "90后女生高职毕业任教清华", "外交部回应高市早苗胜选", "北极4万年古生物正在苏醒", "外交部：台湾问题是中国人自己的事", "酒席为小朋友准备两桌肯德基", "小伙辞去月薪8千工作摆摊日入破千", "杨振宁缅怀室内的鲜花都摆不下了", "免费火锅骗走600多名老人4200万", "全球首款水运“高铁”来了", "被抢鸡排校长离世有1千多人送别", "被学生抢鸡排的校长病逝", "法国前总统萨科齐入狱服刑", "卢浮宫被盗珠宝同款电商已上架", "iPhone频繁打错字不是你手残", "金价大涨影响年轻人结婚", "李在明贴身保镖火了", "烤肉店用玉米做燃料引争议", "韩国男子逃离柬电诈园 使馆拒开门", "两个法国人裸辞后徒步一年到新疆", "浙江象山稻田瑜伽引争议 镇政府回应", "477元买16只螃蟹 收到2死蟹14臭蟹", "阿宽食品回应红油面皮有印度谷螟", "#现在还适合买入黄金吗#", "柬太子集团超910亿韩元资产被冻结", "学者：很多台胞敢大胆说我是中国人", "莫迪称巴军听到印航母名号睡不着觉", "高市早苗内阁名单公布", "31省份最低工资一览表", "李政道研究所：深切缅怀杨振宁先生", "高市早苗成日本首位女首相", "济南凭啥综合实力全国第五", "官方通报“为人民服务”航标被破坏", "王楚钦多哈夺冠球台运回了先农坛", "千年一遇 莱蒙彗星到达近地点", "老人8天内4次偷窃同一家店铺", "韩国承认游戏产业被中国反超", "苏丹首都喀土穆遭大规模空袭", "河南一老板挣100万分给员工85万", "00后对出莫言上联获10万奖金"]

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
