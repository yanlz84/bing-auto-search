// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.43
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
var default_search_words = ["习近平主席访俄这些细节令人难忘", "中美双方降低超100%关税", "中方对会谈结果满意吗？外交部回应", "中美日内瓦经贸会谈联合声明", "汶川地震67只搜救犬已全部离世", "中美各取消91%关税 暂停24%关税", "利用工作之便出售公民个人信息？罚", "网红迪士尼在逃公主每天只睡6小时", "荔枝榴莲价格跳水近30%", "刘德华自曝大减片酬拍戏", "#美大降关税意味着特朗普认怂了吗#", "北京发布e起辟谣同心护网倡议书", "暴涨近13000点 巴基斯坦股市熔断", "官方通报一出租房疑存非法代孕活动", "吉利高管回应奇瑞高管“烂车”言论", "中国稀土出口管制还在继续", "现货黄金跳水 日内跌2.37%", "郎朗说儿子四岁多了还没开始弹琴", "孙俪女儿拉丁舞夺冠后被男老师亲脸", "青岛两行人相撞案暴露了什么", "巴基斯坦民众走上街头疯狂庆祝", "印巴空战举世震惊 岛内“台独”无声", "杭州今天入夏", "9岁女孩患罕见病紫外线过敏", "巴总理谢中国时 同传激动到声音颤抖", "广西党委政法委副书记李文博被查", "骑士步行者爆发冲突", "印方称不愿猜测击落的巴方飞机数量", "巴方：击落印84架无人机 巴1飞机轻伤", "步行者击败骑士3-1夺赛点", "汶川地震亲历者十七年后的独白", "俄乌冲突真的要结束了吗", "身高1.68米的小伙与2.2米的女子相恋", "多哈世乒赛看点：孙颖莎背靠背冲冠", "再看空降兵十五勇士当年惊天一跳", "上官正义讲述暗访代孕机构经过", "印巴冲突到底谁赢了", "巴基斯坦人竖大拇指赞中国枭龙战机", "长沙一乡村别墅现地下代孕交易", "曾凡博坐轮椅抵达CBA总决赛现场", "北京民营火箭发射订单已排到明年底", "三句话解析中美经贸会谈实质性进展", "游客因高反抢救无效离世 医生提醒", "被羁押的杜特尔特参选菲达沃市市长", "圆明园芍药花海上线", "印巴主动向中国“交底”", "普京提议重启俄乌谈判 外交部回应", "张杰演唱会播放女儿的语音", "60一斤的新疆冬厘果究竟是什么", "商务部回应打击战略矿产走私出口", "哥伦比亚总统抵达北京"]

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
