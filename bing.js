// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.427
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
var default_search_words = ["合力开创法治中国建设新局面", "高市早苗求锤得锤", "中方反击开始了 更多反击已经就绪", "绿色全运 粤港澳共绘低碳新画卷", "《鬼灭之刃》票房暴跌 上座率仅1%", "樊振东3比1胜王楚钦", "“公考季”着急想上岸？网警提醒", "75岁老人全网求认干女儿：给一套房", "台当局竟要求民众绝不向大陆投降", "日本广岛牡蛎大规模异常死亡", "“冷美人”赛后头发硬如石头", "新疆喀什地震致房屋倒塌系谣言", "柬埔寨劫囚女子因高颜值引关注", "男子开奥迪上班 被婚车车队当成头车", "人民日报：这7个问题 日方必须说清楚", "外交部回应赖清德晒午餐吃日料", "美依礼芽支持中国后遭受外界压力", "欧阳震华自曝曾遭“蛇缠腰”险失明", "羽绒服迎来“涨价狂潮”", "“日本人会把账算在高市早苗头上”", "马龙黄友政3比1许昕周恺", "胡彦斌易梦玲海边拥吻恋情曝光", "外交部：请日方自重", "游族董事长林奇遭投毒案始末", "陪看男团决赛：樊振东王楚钦马龙出战", "德国医疗展盒饭致200名中国人中毒", "罗晋父亲去世", "日本一天爆发两场抗议集会", "完美谢幕！“雅思组合”混双夺金", "日本网民：大分市火灾废墟如遭轰炸", "云冈石窟大佛冻得流鼻涕？真相来了", "中国公民沦为“矿奴” 使馆紧急提醒", "人民日报发布中日双语海报", "日本民众高喊停止军国主义", "00后女护士回应转行做酒店前台", "中国稀土研究有新突破", "研究显示接吻或始于2150万年前", "曝日本最大核电站将获批重启", "超54万张飞往日本机票被取消", "爱达邮轮回应取消停靠日本宫古岛", "鸡排哥与煎饼姐梦幻联动了", "中国游客流失 日本或损失2.2万亿日元", "视觉中国被判侵权向摄影师道歉", "日方不能口头称立场未变却步步越线", "暴利外衣下的宠物殡葬", "日本水产品来了中国也没有市场", "全国静电指数地图发布", "刘景扬回应妈妈说她没有教练", "外交部：借台湾生事只会给日本找事", "退役女兵：若有战召必回", "星巴克被指“追杀式”营销"]

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
