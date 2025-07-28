// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.196
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
var default_search_words = ["习近平文化思想在浙江的溯源与实践", "释永信是中国首位MBA学位方丈", "释永信与多名女性有染并有私生子", "本轮降雨为何如此强盛", "山西载12人中巴失联 已发现1具遗体", "没考上 高校发“未录取通知书”", "“赖清德的苦日子还在后头”", "美国与欧盟达成15%税率关税协议", "揭“大熊猫被虐”谣言背后利益链", "李小冉回怼网友：我就是情商好低", "释永信多家关联公司已注销吊销", "上海市民尴尬：扔旧的比买新的还难", "少林寺官网已删除多篇涉释永信文章", "女子住蒙古包 一觉醒来洪水淹到床板", "少林景区将全面实行线上预约购票", "赵本山近照曝光 头发全白", "次抛消费正掏空年轻人钱包", "抗癌网红雯仔去世 两年前考入985", "汪峰罕见带4娃同行 次女表情拘谨", "救一家三口牺牲的小伙宋士佳下葬", "律师称捡到金饰故意不还或担刑责", "三宝：孙俪不是一个好演员", "安徽霍山两辆大巴车相撞 致1死3伤", "“廉价版ModelY”车型内饰首曝光", "F4五月天共唱《流星雨》引爆全场泪点", "网友墓园遇见具俊晔陪伴大S", "车企奖励暴雨救援车主新车一辆", "加沙民众每天只能给孩子喂盐水", "冯德莱恩：15%税率系欧委最佳结果", "五月天F4鸟巢再合体", "“凤凰”组合拿下赛季第三冠", "夫妻假扮熊猫粉造谣敛财被判刑", "女孩患胃萎缩从90多斤暴瘦至35斤", "牛弹琴：美欧会晤 一个细节意味深长", "白营民代喊话：希望台湾回归正常运作", "温碧霞自曝曾被父母卖掉还赌债", "三名老人避暑途中坠崖 消防紧急救援", "德国一列火车脱轨已致3人死亡", "北京怀柔区发布山洪灾害红色预警", "北京怀柔区三座水库开始泄洪", "樊振东乒超获个人13连胜", "华北局地强降雨抢险救援加紧进行", "德国商界批评欧美贸易框架协议", "青岛海牛2比0天津津门虎", "胡塞武装：将袭击与以合作公司船只", "美国商界高级别代表团将访华", "日本水稻产区面临“新米危机”", "云南普洱山体滑坡事故致5人遇难", "哈马斯高官指责以色列阻碍达成停火", "刚果（布）发生霍乱疫情", "苏丹首都每天停电12小时以上"]

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
