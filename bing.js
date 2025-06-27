// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.135
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
var default_search_words = ["深化规律认识 破解查处难题", "美方将取消对中国一系列限制性措施", "被打不敢还手？新法明确正当防卫免罚", "这些政策给中小微企业真金白银支持", "蔡澜离世", "巴基斯坦防长笑了：将继续买中国装备", "净网：网警公布打击谣言8起典型案例", "苗华被免去中央军事委员会委员职务", "王安宇关晓彤红毯跳舞", "郑欣宜因受伤退出《歌手》本期竞演", "海军参谋长李汉军被罢免人大代表职务", "多地机场辟谣相机电池不能上飞机", "刘亦菲缺席白玉兰红毯", "举报前公婆近亿资产涉贪有调查结果", "香港四大才子均已去世", "福建一公园多棵80万“天价树”死亡", "蔡澜遗体已火化 一生无子女", "蔡澜离别信公布", "美国多州报告火球从天而降", "久尔杰维奇出任国足代理主教练", "鹿晗脸颊消瘦模样大变", "中方回应中国记者在俄遇袭受伤", "多地机场紧急通知：28日起严查充电宝", "蒋欣关晓彤白玉兰后台热聊", "《书卷一梦》穿书题材脑洞大开", "#洪灾过后的贵州榕江现状#", "充电宝召回风波持续发酵 国家出手了", "舒淇陈法蓉等众星悼念蔡澜", "周星驰悼念蔡澜", "疑似黄晓明最霸总的一期", "退学北大考清华男生称学护理屈才了", "“清华先找到了我 北大晚了一步”", "中国足协官宣伊万下课", "炮轰小米粉丝愚忠 东风日产高管道歉", "杨迪怀念和蔡澜录节目", "蔡澜生前最后画面曝光", "成龙发文悼念蔡澜", "成筐充电宝被拦 有人当场崩溃", "哈工大招生视频称公寓空调全覆盖", "小米回应“前总监冯某传言”", "单依纯净整些抽象事", "林更新回应北京到底有谁在", "空调或成东北高校招生大战最大变数", "杨紫回应获奖机会：今天是来学习的", "蔡澜曾谈及怎样面对亲友离世", "蒋欣直接喊王安宇“我儿子”", "东北连日高温 学生躺卫生间水池降温", "加沙15岁男孩饿到只剩18公斤", "#作家称兴趣也能成大学生就业后路#", "哈尔滨高温 高校学生楼道睡觉", "小米YU7推出晕车舒缓模式"]

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
