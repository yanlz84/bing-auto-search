// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.288
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
var default_search_words = ["让和平的薪火代代相传", "福建舰通过台湾海峡", "有小学建议不让老人接送小孩", "这一封封家书来自那些最可爱的人", "罗永浩悬赏10万征集西贝预制菜线索", "勾践“卧薪尝胆”有考古实证了", "微信推出“后悔药”", "世界最大冰山再次发生大规模断裂", "虎跳峡出现不明生物？当地回应", "巴西前总统获刑27年零3个月", "涉嫌“馆长”枪击案 邵柏杰被判无罪", "重庆辟谣“摩托车能上高速”", "浙江反诈抓捕现场堪比大片", "俄美法德等国家确认出席香山论坛", "韩国海警为救中国老人不幸遇难", "女孩遭体罚身亡 老师聊天记录公布", "钱学森之子：刷题抹杀孩子求知欲", "河南这场雨为啥这么强", "境外反华势力对办公邮箱攻击窃密", "中方严厉谴责以色列袭击卡塔尔", "女子偷男友数万元 因已结婚获谅解", "女子用“厨房神器”烤肉致全家中毒", "男孩常年“吸猫”致哮喘急性发作", "21岁女生去年底被骗缅甸仍未救出", "沈阳以最高礼遇迎英雄归来", "对配偶失管失教 杨桦被开除党籍", "男子精神疾病突发怕伤人求助警察", "西贝将向消费者开放后厨", "西贝创始人贾国龙称将起诉罗永浩", "美股三大股指创新高 金龙指数涨近3%", "武契奇表白中国", "俩儿子非亲生案当事人：想要个后人", "他信服刑细节：狱中或当外语老师", "为何建立黄岩岛国家级自然保护区", "罗永浩回应西贝称准备好了", "美国悬赏10万美元找抢手", "国安队长王刚就冲突事件道歉", "牛弹琴：这个新动向 中国须高度警惕", "男子背着钓到的79斤鳡鱼在闹市穿行", "民警仅凭1张照片找到被拐16年的孩子", "FBI公布柯克枪击案嫌疑人照片", "北京将进入美国白蛾幼虫危害高峰期", "卡塔尔：已着手对以色列采取法律行动", "特朗普计划出席遭枪杀盟友的葬礼", "曝特朗普要求以总理不再袭击卡塔尔", "安理会15国强烈谴责多哈袭击事件", "中国直飞阿根廷 全球最长航线将启航", "卡塔尔为以色列袭击遇难者举行葬礼", "KT击败BFX", "山姆的“大路货”为何越来越多了", "日本关东遭遇“创纪录短时强降雨”"]

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
