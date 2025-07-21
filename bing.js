// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.182
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
var default_search_words = ["总书记心中的人民城市", "天水市委书记市长被立案问责", "韩国股民狂买中国股票 名单来了", "台风临近 这份用电安全指南请收好", "特朗普开始审查马斯克", "全家露营遇山洪 妻子和一孩子被冲走", "18岁短跑田径运动员虞锦车祸去世", "在美卖酱香饼被抓小伙：已交钱保释", "40岁“彩铃顶流”歌手回应隐身10年", "女生为交社保被负债200万", "央视曝光农村新公厕只能看不能用", "杭州水务集团干部刘某某潜逃？假", "历史性惨败！石破茂被要求下台", "县委书记挪用6500万被中央通报", "22岁女生在重庆爬楼送外卖6天瘦10斤", "上海市民崩溃：今年的蝉为啥这么多", "55岁男子挑战骑行至海南 途中离世", "网红“闷闷嗲”涉毒在泰国被捕", "女骑手将女儿装外卖箱送外卖", "逼学生抽血换学分 台师大负责人道歉", "联合国：菲律宾贩卖儿童现象令人发指", "韩女子咬断性侵者舌头被判刑", "基孔肯雅热为何在国内大规模暴发", "牛弹琴：特朗普发声 全世界哭笑不得", "常州又被零封 球员赛后掩头痛哭", "苏超全场最能“忍”的人出现了", "福耀科技大学何以吸引高分考生", "老人为乘凉挤满一肯德基 街道办回应", "被骗至缅甸19岁高中生已移交中方", "女子驾车撞倒男孩拖行2米称没看见", "苏州再这么踢吃蟹买不到醋了", "日本执政联盟选举遭历史性惨败", "印女子因出轨被绑柱子上处私刑", "恒河漂浮重约200公斤“神奇石头”", "央视专访英伟达创始人黄仁勋", "台风韦帕带来的大雨还要下3天", "“韦帕”或第三次登陆", "奥巴马政府曾伪造特朗普通俄材料", "展车和“0公里二手车”的区别是什么", "张子宇发文回顾女篮亚洲杯", "台风“韦帕”在广东二次登陆", "报警人笔录没做完 嫌疑人被人赃并获", "丽江古城维护费这笔账该怎么算", "苏超赛程过半 保级大战渐入白热化", "游客称参加火把节被烧伤", "美国关税大棒或令日本政坛生变", "警方回应女子打赏43万被情感欺诈", "《罗小黑战记2》2025开分最高国产电影", "中国和匈牙利顺利完成引渡条约谈判", "美国一警官遭非法移民枪击", "大运会中国队再入5金5银"]

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
