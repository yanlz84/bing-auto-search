// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.55
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
var default_search_words = ["跟着总书记走进“大学校”", "官方印发条例：党政机关带头过紧日子", "中国跌至美国国债第三大债主", "6组数据透视中国市场强大吸引力", "官方：公务用车应选国产 优选新能源", "工作餐不得提供高档菜肴和香烟", "2人传播涉刘国梁不实信息被处罚", "印度卫星发射失败：掌声刚停就下坠", "匿名校友向复旦大学捐赠1亿元", "白宇因气胸已做6次手术", "王栎鑫在音乐节上吃臭鳜鱼", "纽约大型帆船撞桥多人落水现场曝光", "气象部门回应新疆不明飞行物", "墨西哥海军船只撞桥事故已致2死", "戴230万耳环女星被曝曾晒亿元豪宅", "曝拒绝接待中国人的日本餐厅已歇业", "中国车企为何要造自己的船", "工作人员抱着到家的国宝嘴角压不住", "外交部发言人郭嘉昆：发言人就是战士", "韩庚老婆挺二胎孕肚练瑜伽", "沃尔玛将涨价 特朗普：怎么能怪关税", "河中现死鱼 市委书记现场察看", "抢微波炉热饭 是打工人的世界大战", "印度卫星发射失败主持人快哭了", "覃海洋100米蛙夺冠", "孙杨潘展乐出战全国游泳冠军赛", "孙颖莎王楚钦3-0美国选手光速晋级", "新疆不明飞行物是啥 科普博主揭秘", "邓超孙俪工作室齐发声打假", "高速收费站亭内惊现长蛇", "曝马筱梅已怀孕 刚怀不久", "浙江广厦球迷掌掴北京队工作人员", "《藏海传》连更8天", "新冠阳性率升高 专家称5月下旬达峰", "乌克兰遭最大规模无人机袭击", "胖东来高管怒斥柴怼怼：毫无做人底线", "“存款特种兵”逐渐淡出江湖", "小女孩往陌生人的饮料中加洗手液", "李晟产后抑郁 生完孩子曾整晚哭", "张本智和4-1林仲勋 晋级64强", "如果梁文锋读博 还有DeepSeek吗", "大熊猫“福娃”和“凤仪”启程回国", "王曼昱4-1击败波兰悍将迎开门红", "稻城亚丁景区一女游客因高反去世", "网传林更新签约杨幂新公司", "演员姜尘力挺黄杨钿甜", "女子自制捕蚊器5小时抓五六十只蚊子", "印度地球观测卫星发射失败", "黄子韬创办的卫生巾工厂首次开", "首款国产宝马新世代车型在沈阳下线", "艾威悲痛回应妻子去世 透露其遗愿"]

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
