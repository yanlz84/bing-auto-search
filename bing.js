// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.416
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
var default_search_words = ["习近平会见泰国国王哇集拉隆功", "日本人士：高市涉台言论违背国际法", "日本若碰红线新账旧账一起清算", "“水上芭蕾”是如何练成的", "冷美人退赛后仍可获得8666元奖励", "基辅几乎所有地区都遭袭", "外交部提醒中国公民近期避免去日本", "外交部用日英双语连发六张海报", "日共要求高市早苗撤回涉台挑衅言论", "李在明：毫不动摇推进中韩关系发展", "德国将再投入巨资采购美制武器援乌", "南朝四百八十寺之一被烧系谣言", "3岁男童患甲流1天后去世", "寒潮将影响我国 局地降温可超14℃", "王楚钦打趣让马龙珍惜采访机会", "市场监管总局拟出台新规", "英国男子每天翻垃圾箱 月入5600元", "日本男足海报在日本引发巨大争议", "陈冬：感谢伟大祖国 我们回来了", "林高远刘诗雯摘乒乓球混双金牌", "马龙不认为自己是老将", "男子打92岁痴呆母亲被刑拘 邻居发声", "为什么四川舰不能当航母用", "45岁卡车司机在俄罗斯不幸遇难", "日本多名前首相反对高市早苗言论", "潘展乐夺得男子100米自由泳金牌", "最高法提醒：这些鸟不能随意捕", "母女“风水师”涉嫌3亿元诈骗被捕", "福建舰常驻三亚军港意味着什么", "“汪汪队”在新领域立大功", "比利时反对利用俄遭冻结资产援乌", "江苏女排3比0河南女排", "中国驻日大使奉示约见日方官员", "中方敦促个别大国慎用否决权", "提倡零彩礼1年后于东来晒成绩单", "“航天鼠”在太空生活得如何", "北京6G实验室十大进展首次集中发布", "马龙职业生涯仅缺全运男团金牌", "黄金“代购”火了！律师紧急提醒", "美将部分农产品移出对等关税清单", "董宇辉用英文介绍为何中国人友善", "专家解读解放军三大利器传出喜讯", "江苏队夺全运会羽毛球男子团体冠军", "解密福建舰电磁弹射背后的硬核支撑", "中国空间站第九批实验样品返回交付", "万乐天获全运会50米仰泳金牌", "范波任江苏省委常委、苏州市委书记", "证监会主席吴清最新发声", "男子戴假发穿红裙扮女顾客盗窃被拘", "南航C919飞抵阿联酋 将亮相航展", "宝马召回超14万辆车 涵盖多款车型"]

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
