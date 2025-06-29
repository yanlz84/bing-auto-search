// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.138
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
var default_search_words = ["习近平心中的“大学之道”", "辽宁舰遭外军航母夹击 歼15挂弹起飞", "男生高考700分仍逃不过班主任批评", "这一刻 所有付出都值得", "中国：反对以牺牲中方利益换关税减免", "宋佳获奖后发文：恭喜1米73大美女", "南京可口可乐博物馆60岁以上禁入", "李雪琴怎么美成这样了", "女子带3名光身幼儿外出时晕倒", "预言日本7月大地震作者改口了", "贵州榕江拉响全城警报", "男子造谣榕江洪灾致13死被处罚", "贵州榕江街道7分钟被洪水完全淹没", "在上海 一块砖头能砸中10个主理人", "宋佳今年目前为止最好的获奖词", "四天内两次 榕江洪灾为何如此严重", "中方回应加拿大命令海康威视停止运营", "马斯克再批特朗普政府税改法案", "伊朗国葬现场数万人高呼：美国去死", "鹿晗颜值回春了", "鹿晗工作室：从没回过因为一直都在", "贵州榕江居民讲述汛情经历", "洪水1小时覆盖近半个榕江城区", "肖战参加《藏海传》庆功宴", "单位仅10名员工 办公用房近4000平", "男子借伞拒付押金还砸前台", "郑钦文本届温网要超越“自我”", "贵阳有人高空抛两把菜刀险砸人头上", "清华硕士靠文眉月入3万被母亲反对", "女子输液过敏 在救护车转院途中去世", "U19中国男篮惜败加拿大", "泰柬“录音门”：佩通坦反将洪森一军", "一颗问题电芯让120万充电宝困在机场", "榕江一副镇长回应敲锣通知撤离", "四川局地将有特大暴雨", "服刑18年男子将出狱已获2个工作机会", "特朗普不认为伊在美袭击前隐藏浓缩铀", "李雪琴紫色抹胸长裙造型", "三航母 意味着什么", "为了卖房当中介 房子仍没卖出去", "有黄牛加价1.7万转卖小米YU7订单", "贵州一银行原纪委书记被情人举报", "纪检部门回应贵州一银行领导出轨", "旅客带780克动物粪便入境被查", "全球首艘纯氨燃料动力示范船舶首航", "李兰迪刮彩票以为中了7万", "榕江堵车严重很多人走路撤离", "涉袭击伊朗 美媒爆猛料", "有3C标识充电宝也不都能登机", "鹿晗演唱会《我们的明天》大合唱", "伊为以袭击中遇难同胞举行悼念仪式"]

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
