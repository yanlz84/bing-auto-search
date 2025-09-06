// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.276
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
var default_search_words = ["习近平鲜明宣示这8个字", "中国正规划对1颗小行星实施高速撞击", "美国拘捕约300名韩国人", "目之所及皆是自豪模样", "半年一改款 汽车变成快消品了吗", "山东菏泽一中学初一多达94个班", "特朗普签令 美调整关税政策生效范围", "最快女护士被解聘或调岗？医院回应", "俄方要求日本完全承认二战结果", "中国最好的武器是不把钱花在战争上", "委内瑞拉2架F-16挂载武器飞越美军舰", "人社部辟谣“花钱考证才能入职”", "美股收盘：中概股金龙指数涨超1%", "阿努廷当选后第一时间去跪拜父亲", "陈铭回应公开哥哥遭注射药品经历", "深圳8区进一步放松住房限购政策", "金正恩回到平壤", "普京回应中俄印“龙熊象”比喻", "南海热带低压或加强为第16号台风", "特朗普饭桌上挨个要钱", "武契奇：很快将对中国进行国事访问", "特朗普签令 美国防部能叫战争部了", "阅兵场内外这些年轻人为何出圈", "今起发售 这些旅客买动车票有新优惠", "多国欲承认巴勒斯坦国遭美以威胁", "肯德基冰豆浆比热豆浆贵1元", "知名抗癌博主富国去世", "外媒：美将向海外基地部署F-35战机", "人均曾近万的米其林餐厅撑不住了", "山东日照海域将进行海上火箭发射", "乌军士兵乔装成俄军 枪杀两名俄士兵", "牛弹琴：特朗普又要开搞欧洲了", "钓鱼大爷落水获救后复盘全过程", "小电驴市场：新国标车型多店未到货", "#泰国新总理阿努廷是什么来头#", "女子求职背调“亮黄灯”被拒录", "台湾教授苑举正分享回山东的计划", "公司合作失败扣留乙方150万诚意金", "亚朵酒店回应住客被虫咬伤", "花旗中国42家分支机构已注销或吊销", "英国首相斯塔默大幅改组内阁", "雷军称要让豪车用户看见小米", "市民拍下阅兵后最动人“军民互动”", "北大校长用李大钊发刊词寄语新生", "网红文具是课堂“隐形干扰源”吗", "甘肃甘南合作市突遭暴雨冰雹", "詹姆斯与赵睿李梦现场互动", "阿尔卡拉斯晋级美网决赛", "香港机场中转7小时以上可免费游市区", "重庆一工人维修墙面时从9楼坠落", "立陶宛证实收到美国削减军援通知"]

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
