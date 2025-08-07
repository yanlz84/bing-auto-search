// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.216
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
var default_search_words = ["311万条建议里承载怎样的民主实践", "章家敦叫嚣对华加征600%关税", "因为穷 他成了今年脱口秀最强黑马", "这个暑假沉浸式感受非遗的魅力", "专家建议10岁开始存养老钱最划算", "秋天的第一杯奶茶花束火了", "7个月女儿被哥哥杀害 弟弟要求重判", "二婚夫妻办假离婚结果就男方信了", "特朗普：将对芯片半导体征约100%关税", "多名富豪在深海瞬间死亡", "Zara广告因模特太瘦被禁", "结婚补贴一万元？新疆警方辟谣", "新疆一景区吊桥桥索断裂致5死24伤", "立秋进补“四不吃”", "李连杰：我已经是腊肠了", "日军曾悬赏15万美元追杀照片摄影师", "花千万买豪宅的年轻人开始维权了", "神秘人3.6亿接手徐翔母亲部分股份", "丈夫抱怨没吃到鸡蛋 女子崩溃掀桌", "17岁加沙少年被饿死 曾是体育冠军", "儿子嫌77岁母亲再婚丢人 生病时不管", "6月以来上海人“熬夜”花掉880亿元", "年轻人入手奇葩房型 爆改成梦中情房", "湖北省委：这类干部直接提拔", "莫迪将于8月31日至9月1日访华", "网红吊桥断裂亲历者：手还在颤抖", "“秋老虎”会登场吗", "日本人口降幅创有记录以来新高", "小孩哥旅游参观 抬头发现抱错妈了", "郭品超自曝身高体重称自己没媳妇", "防城港市防城区委书记和区长同步调整", "沈玉琳发文确认患白血病", "一宝妈称在影楼哺乳被拍", "“扫墓潮”突然爆火：给曹操送布洛芬", "4.5万元网贷合同居然冒出86个出借人", "大学志愿 我填了“专业撸猫”", "新疆一景区网红桥断裂 目击者发声", "杭州高架一新能源车起火", "德国发现二战未爆炸弹超万人被撤离", "国安部曝光境外间谍最新窃密手段", "四川重庆等地高温加班到凌晨", "特朗普对俄亮出两个“绝招”", "特朗普对印度加征25%额外关税", "广东连日暴雨 蟑螂集体“搬家”", "监控拍下女童泳道内遭拍打受伤", "警方通报货车撞进奶茶店致2死2伤", "牛弹琴：印度的美梦彻底破灭了", "拜登批准的巨型风电项目被叫停", "马斯克的“美国党”为啥没消息了", "美国神秘核潜艇去向成谜", "女孩确诊白血病男友坚持和她领证"]

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
