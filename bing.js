// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.256
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
var default_search_words = ["习近平会见俄罗斯国家杜马主席", "男子高速戴恐怖面具 杭州交警通报", "景区游客从40米高空坠落：水里有血迹", "九三阅兵三次演练卡点大片", "特朗普：美国将不再直接资助乌克兰", "郑恺停掉岳母亲属卡？本人发声", "两男子盗窃446斤寺庙“金灰”被判刑", "员工多次迟到早退被开除 法院判了", "40岁港星转行做搬运工养4个儿子", "加沙记者直播中遭以军杀害", "何小鹏：很多人劝我给小鹏汽车改名", "男子假冒“联合国外交官”被拆穿", "摄影师拍到“蓝色喷流闪电”", "中国学生在瑞典拍敏感设施标牌被抓", "苹果发布会定档", "美团退款没到账？全民开始“查账”", "吴艳妮压线晋级东京世锦赛", "“身首离断”患者已转入普通病房", "73岁老人打死71岁妻子 一审被判无期", "美将对印加征50%关税 莫迪强硬表态", "多个奶茶品牌回应检出反式脂肪酸", "泰勒斯威夫特官宣订婚", "赵心童不敌马奎尔", "牛弹琴：特朗普和莫迪现在都很愤怒", "马奎尔称赵心童是一位伟大球员", "女子怀疑57年前被抱错 寻亲生父母", "特朗普：曾认为解决俄乌冲突很容易", "何小鹏：如果你想害人 就劝他去造车", "重庆湖北等局地最高气温可超40℃", "中使馆：赴美留学生慎选休斯敦航线", "外聘老师提供实习却是帮电诈打掩护", "记者死于以空袭 美联社路透社讨说法", "猫咪误入动物园虎园被咬死", "古巴外长：感谢中国支持", "中方回应“日本呼吁不参加九三阅兵”", "盛夏“收官”之雨来了", "特朗普祝贺泰勒斯威夫特订婚", "李在明称韩日历史问题已解决", "阿根廷压哨绝杀哥伦比亚进八强", "受贿3.16亿余元 刘星泰被判死缓", "中方回应“特朗普希望尽快访华”", "九三阅兵倒计时7天", "中方回应美威胁对华征收200%关税", "浙江一酒店内现千年古墓", "江西上饶一医院住院楼起火", "版权之争后 汪苏泷张碧晨首次同台", "王鹤棣方回应网传录音", "海口半夜突响防空警报 人防办回应", "男子遇五步蛇想抓来玩 被喷一脸毒", "特朗普送了李在明一张签名菜单", "星巴克店员漏点单被咆哮辱骂10分钟"]

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
