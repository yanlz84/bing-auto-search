// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.451
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
var default_search_words = ["总书记关心的这件事 和你我息息相关", "日本北海道熊尸体多到装不下", "充完电不拔充电器是在拿命“豪赌”", "刷1条视频上百个集装箱出海了", "日本军事准备曝光：研发“万能血浆”", "生活中看到这种黄色小花立即上报", "网警破获“AI换脸”侵入计算机案", "G7凭什么对中国提3个不许", "外交部回应日本团体请求访华", "外交部：台湾没有什么“外交部长”", "2025年十大流行语公布", "激素蛋大量流入市场系谣言", "5台电脑采购价近3亿？系单位标注错误", "为什么上班以后越来越胖", "男子骗女友透支信用卡后将其杀害", "香港大埔火灾已致156人遇难", "一夜之间所有的缅因猫都在被盘问", "男子假借给女友买鞋趁机揩油女店员", "从从容容游刃有余入选年度流行语", "人民网评如何破解打印作业的无奈", "中国买大豆毁掉巴西雨林？假的！", "航司通报东京飞上海航班紧急返航", "“台湾一旦沦为战场什么都是空谈”", "三星发布首款三折叠手机", "一A股董事长反对当董事长：薪资不满意", "院线经理称《疯狂动物城2》没有对手", "军嫂迎接退役的一级军士长", "男子通过外卖找到妻子打赏的男主播", "小电驴新国标实施首日：涨价几百元", "福建支持台胞开设沙县小吃门店", "曝乌高官辞职对泽连斯基破口大骂", "刀疤哥退赛 荒野求生决赛还剩10人", "河南发现吴石烈士履历表", "改装电动自行车“步步惊心”", "英国首相承认脱欧重创英国经济", "中方回应俄对中国公民免签：双向奔赴", "外交部：坚决反对日方为军国主义招魂", "极端天气已致斯里兰卡410人死亡", "中国能源与动力领域连获重大突破", "为什么打了疫苗还是得了流感", "冷冷冷！“极冷”冷涡系统形成", "科兴制药赴港IPO", "中国代表致函联合国秘书长批驳日方", "中方回应英首相发表涉华言论", "熊征宇任武汉市代理市长", "高校回应凌晨紧急疏散数千学生", "中国首个火箭网系回收海上平台交付", "墨西哥大毒枭之子相继获罪", "国民党智库大换血 6位董事名单曝光", "“假奶粉”问责板子别只瞄准造假者", "这些地方已实现生育津贴直接发放个人"]

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
