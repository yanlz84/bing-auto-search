// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.210
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
var default_search_words = ["潮起钱凯港", "“田径甜妹”收到北大录取通知书", "汉江现巨型怪物？夜钓者拍下惊悚一幕", "蜂群狼群！陆军首次披露无人作战模式", "年过九旬骑车去办公室的院士走了", "饭店用脏话命名 知情人：是店主绰号", "常州队只剩最后一画了", "高铁列车员发试卷 小朋友一秒静音", "理想回应和乘龙重卡碰撞测试", "王兴兴又有新身份", "外卖员1天湿透6身衣服病倒入院", "男子编造2岁女儿被抱走遭处罚", "男子杀害7个月大侄女：不想活了", "法拉第方回应新车抄袭长城", "央视：小红书成针剂违规代打接单平台", "教授论文称汉谟拉比与商汤是同一人", "游泳世锦赛中国队15金12银10铜收官", "跑楼小孩代送外卖藏“多输”风险", "贵州一漂流景区大量游客滞留至半夜", "于正力挺赵露思：可以合伙开面馆", "郭晶晶以裁判身份执裁跳水比赛", "数千元滑雪装备一公司报关几百元", "美要求多国停购俄罗斯石油遭拒", "灵隐寺回应辣椒酱超辣：叫魔鬼辣椒", "在这里 人和车都能“充电”", "陆配村长遭台当局解职 村民抱不平", "未成年人热衷医美 家长不能听之任之", "央视曝光电动车智能服务失效问题", "西藏阿里隆重安葬8位烈士", "《和平精英》世界杯争冠之夜", "2025暑期档电影总票房已破70亿", "台官员赴美谈判后三缄其口遭批", "常州0-5不敌盐城 遭遇苏超最惨一败", "《西游记》如来佛祖扮演者朱龙广去世", "今夏酷暑会加重日本的大米危机吗", "EDG零封LNG豪取五连胜", "广电总局集中整治虚假宣传医药广告", "韩国农产品价格上涨 1个西瓜173元", "高金素梅批赖清德不关心台南部灾情", "《731》定档 将于918上映", "中俄海上联演有哪些看点", "揭秘福建舰电磁弹射试验", "纽约时报：全球贸易史迎来黑暗一天", "广州：市民可定位查看蚊媒风险等级", "TYL2-1JDG晋级季后赛", "中国队女子4X100米混合接力铜牌", "坚持购买俄油 印度为何硬刚特朗普", "官方发布地质灾害红色预警", "樊振东注册乒乓球欧冠联赛", "《731》预告片提醒：未满18岁谨慎观看", "以国安部长首次在圣殿山公开祈祷"]

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
