// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.246
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
var default_search_words = ["甲子回眸 盛世如愿", "那个感动全网的女孩意外离世了", "高铁无座票与二等座同价引热议", "超近距离感受阅兵训练", "“鲁迅同款毛背心”火了", "泽连斯基这次是真的会“谢”", "2枚俄巡航导弹击中在乌美国工厂", "老人免费乘公交城市撑不住了吗", "黑龙江一“恶势力团伙”全员改判无罪", "为不拖累孩子政审忍受家暴？女子回应", "“僵尸松鼠触手兔” 美国又现变异鹿", "网传重庆遭遇百年难遇洪水？不实", "因二胎儿子跟母姓 男子起诉离婚", "一正厅一副处官员落马 系同名亲兄弟", "4000名日军曾用手榴弹集体自杀", "牛弹琴：特朗普又变脸了吗", "第一批宝爸宝妈已完成育儿补贴申领", "全球最古老海洋哺乳动物现身南海", "福建一村出了33名博士", "美国可能对委内瑞拉动武 中方表态", "特朗普前往华盛顿街头巡逻", "面食店夫妻在面条饺子皮里加硼砂", "付巧妹成为中科院院士有效候选人", "双预警齐发 多地仍有暴雨大暴雨", "老人用敌敌畏擦身治湿疹病危", "男子逼问妻子“是否出轨”并施暴", "上海至杭州高铁可行性研究报告获批", "湖北一村民称遭老虎袭击 当地通报", "轿车逆行冲向少年 警车中间一横救5人", "两儿子非亲生 奶奶痛哭孩子不是俺的", "佛山新增基孔肯雅热确诊病例17例", "出现这些症状可能是基孔肯雅热", "网红景点计时拍照 网友建议全国推广", "乘客吐槽一等座背后放售货车太闹心", "中国留学生起诉美大学索赔1亿美元", "购车补贴比演唱会还难抢？多地回应", "张本智和无缘欧洲大满贯八强", "为什么总买不到宣传海报上那份饭", "尼康将于9月底关闭横滨工厂", "孙颖莎3-0早田希娜晋级女单8强", "美欧就一项贸易协定框架达成一致", "鄂尔多斯窟野河已降到警戒水位以下", "以总理批准接管加沙城计划", "王曼昱3-2逆转长崎美柚晋级8强", "京东重启社区团购：已在四地开店", "二季度美国智能手机销量同比增长9%", "麦当劳天津公司被执行186万", "梁靖崑温瑞博2比3郭勇冯耀恩", "公牛明年1月退役罗斯球衣", "美驻以大使指责欧洲阻碍加沙停火", "白俄罗斯总统卢卡申科宣布将访华"]

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
