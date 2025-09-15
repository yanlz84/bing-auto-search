// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.294
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
var default_search_words = ["总书记牵挂的桃花源开出致富花", "人民日报、新华社、央视集体发文", "上市没几天iPhone 17已跌破发售价", "住房租赁新规来了 如何影响你我", "妈妈亲手缝的耐克书包火了", "韩国中小学班级人数为何不减反增", "女子坐到纹身展评委身上 警方介入", "男子种猴面包树18年 2棵达结果要求", "“天价墓地”变天了", "三人伪装外卖员钓鱼佬窃取军事秘密", "249万买商铺8年只收到13万租金", "9月起购房无需交维修资金系谣言", "“昆仑童子”案告破", "波兰总统签署决议 同意北约部队驻扎", "冰雹砸伤女子两大哥冲上前护送", "张曼玉IP显示仍在中国香港", "没人告诉无语哥干团播这么累吗", "3000元当合伙人是暴富机遇还是陷阱", "员工因拒绝垫付差旅费不出差被开除", "男子炖鸡时酣睡 醒来身边站满消防员", "TI2026落地中国上海", "梅德韦杰夫生日当天 普京为他授勋", "央视曝光沉香商家挂羊头卖狗肉", "乘客机场下跪求助工作人员 海航回应", "河南多地遭“小白虫”侵袭", "美的回应一天工作14小时离职被欠薪", "全国首位机器人博士生入学上戏", "王楚钦4-0横扫雨果夺冠", "省委书记省长接“杨靖宇支队”战旗", "女子潜水被遗忘海上漂了45分钟", "广州：近两百名秋季新兵启程赴军营", "当事人回应白菜里发现老鼠窝", "小区6台加装电梯基本完工却不能用", "以军一天炸毁加沙城4座高层建筑", "湖南15岁女孩被火车撞死案将开庭", "王楚钦孙颖莎夺冠合照", "孙颖莎4-3击败王曼昱夺冠", "“排队王”太二酸菜鱼一年关店65家", "乌军方称对俄铁路发起特别作战行动", "卡塔尔首相与伊朗外长讨论多哈遭袭", "“升级版”太空菜园迎来丰收时刻", "牛弹琴：一场大型运动在美国火热进行", "波军将大量美制M1坦克调往边境", "中国汽车工业协会发出倡议", "柏林举行大规模集会反对德向以供武", "樊振东打出侧切超级球", "家中闯入野猪大人逃跑把孩子忘房里", "卡塔尔首相：卡方将继续调停加沙冲突", "中美在西班牙举行经贸会谈", "樊振东收获德甲三连胜", "英超：曼城3-0大胜曼联"]

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
