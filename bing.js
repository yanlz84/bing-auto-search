// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.208
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
var default_search_words = ["“八一”这一幕 令人热血沸腾", "福建舰入列进入最后攻坚时刻", "被高空坠物砸亡女孩原计划中秋节订婚", "信息支援部队演练画面首次曝光", "《家有儿女》童星被女儿追剧认出", "牛弹琴：印度不简单 开始反击了", "济南400年四合院3500万起拍", "阿姨退休后秒退几十个群手机都变轻", "日本小哥凭“世界最长下巴”走红", "贾玲股四头肌好结实", "被要求给柳岩道歉 包贝尔爆粗口", "新疆阿勒泰7月底下大雪？当地回应", "赵露思患重度焦虑和重度抑郁", "华尔街传奇投资家清空美股持有A股", "丁俊晖魔咒继续 赵心童不敌威尔逊", "刀郎演唱会场外观众唱《我的祖国》", "官方通报女司机亮证逼迫让路事件", "广东全民总动员开启大灭蚊", "乘龙卡车再发两张海报内涵理想", "东契奇续约湖人", "68岁潘长江演短剧：阔太爱上60岁保洁", "中国女子赞比亚失踪近30天 确认遇害", "普京接受采访时小狗乱入镜头", "男子8吨牛肉卖38万 收到货款被冻结", "新房漏水2年 业主屋顶常年贴尿不湿", "赵心童回应连输六盘", "五月天现场送汪苏泷歌曲版权", "《南京照相馆》导演申奥为什么又赢了", "俄女孩因太爱吃炒面定居温州8年", "特朗普的“清算名单”还能拉多长", "苏伊士运河国有化后创收1534亿美元", "《哪吒2》“归来”又拿第一名", "中国农场主非洲失踪近30天确认遇害", "女子称充电不久就被邻车抢走充电枪", "苏超比赛中场停电 场馆致歉", "英国女孩“打飞的”来沪治脊柱侧弯", "高考生收到两个大学的录取通知书", "曾负责特朗普案的前检察官遭调查", "“哪怕牺牲 我也要守住这3秒”", "男子行车时天降剪刀直扎车头", "盘点银河酷娱旗下的艺人", "驻日本大使馆再次发布安全提醒", "中国海军实力何时能超越美国海军", "黄子韬徐艺洋上综艺秀双人舞", "一家三口赶海1人失踪1人进ICU", "Scout状态奇差无比", "匈牙利总理谈俄乌冲突的原因", "曝赵露思与银河酷娱合约到2030年", "日本男子树下躲雨遭雷击后奇迹生还", "河北省气象台发布高温橙色预警信号", "张家乐刷新女子链球世界青年纪录"]

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
