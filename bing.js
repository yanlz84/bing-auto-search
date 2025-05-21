// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.61
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
var default_search_words = ["看工业“关节”有啥“绝活”", "巴基斯坦警告印度：我们不是巴勒斯坦", "今年已有22位演艺界名人逝世", "#北京范儿#", "2元面包批量“收割”创业者", "央视爆猛料：空战实现“A锁B射C导”", "罗永浩为还债开辟带货新平台", "朱媛媛清明在福州被偶遇 辛柏青陪同", "女子取500万想快递给网恋男友被劝阻", "一汽大众这个羊毛赶紧薅", "蜜雪冰城回应网友倒卖柠檬水赚差价", "有图就有真相吗？警惕AI图片造假", "宜宾一纺织厂发生火灾 疑员工点火", "辛柏青发文时间有深意", "毛宁：国际调解院总部将设在中国香港", "江西一女子从12楼不慎坠落奇迹生还", "国家话剧院悼念朱媛媛", "阿里影业拟改名为大麦娱乐", "村民在外务工老宅被拆 镇政府回应", "全国游泳冠军赛 孙杨潘展乐全力冲金", "萝卜快跑一季度全球订单超140万", "《藏海传》藏海开大极限一换一", "孙红雷再跳霹雳舞嗨翻全场", "大学生坠亡化粪池 事发地现状曝光", "特朗普：加拿大想加入“金穹”计划", "朱媛媛曾谈生命最后想做的事", "学生掉入化粪池后校内增设警示牌", "脱口秀冒犯的艺术不是咸猪手的借口", "印度直说了：美国没参与 没通知他们", "辛柏青换蜡烛头像悼念朱媛媛", "具俊晔金宝山看望大S被偶遇", "#小满万物初盈#", "美国开发金穹系统或引发核军备竞赛", "湖北启动重大气象灾害Ⅲ级应急响应", "王建军被免去证监会副主席职务", "外交部回应美“金穹”导弹防御系统", "俄乌就谈判问题立场仍存分歧", "肖战《藏海传》reaction简直演我", "商务部回应美企图全球禁用中国芯片", "辛柏青曾为了朱媛媛放弃演《潜伏》", "巴基斯坦内政部长回应校车爆炸事故", "国乒双打三项都失去双保险", "央视网评广东校服自愿：斩断利益脐带", "错过航班女子称考虑起诉视频发布者", "日本米价居高不下成石破茂内阁难题", "山西一烧烤摊扰民 住户去店里大闹", "妻子智力倒退回3岁丈夫悉心照料", "曝黄子佼孟耿如已离婚 男方回应", "剧场回应脱口秀女演员表演中被猥亵", "同行者回忆男生坠化粪池瞬间", "华纳回应陈奕迅女儿签约"]

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
