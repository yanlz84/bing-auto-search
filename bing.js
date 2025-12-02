// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.450
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
var default_search_words = ["总书记关心的这件事 和你我息息相关", "日本国宝级歌手要求高市撤回言论", "“排骨羽绒服”成冬季爆款", "创新消费场景 冰雪旅游快速升温", "避孕药品用具将征税 价格可能上涨", "《疯狂动物城2》为何如此火", "25岁小伙离世2小时后被公司设为离职", "局地-40℃极寒 下半年最冷一天来了", "“孩子多放假家长不放假” 矛盾何解", "金灿荣：日本盟友不表态已说明问题", "俄称控制红军城和沃尔昌斯克", "“宁波有人醉酒持刀捅2人”系谣言", "男子取170万银行门口遭抢被打成重伤", "“嘎子”谢孟伟夫妇再被执行797万", "日本学者：高市“高支持率”不是民意", "14种“进口”奶制品产自河南出租房", "流感阳性率45%并非身边近一半人感染", "宁波富豪34亿元股票分给子女", "曝高市早苗花8千万日元仍败给石破茂", "蔡正元：“驭空戟-1000”性价比炸裂", "外交部4分钟痛批日方错误言行", "女子验收新房发现已有陌生人入住", "挖掘机女司机夜间作业偶遇东北虎", "入伍30年的一级军士长光荣退休", "中纪委11月打下6虎", "北京打工人请拿出最硬核的过冬装备", "200元一片的流感药购买人数暴增6倍", "中方回应有日本歌手演唱会被取消", "乌美就领土问题讨论长达6.5小时", "俄77岁老奶奶在CS2中上演“一穿五”", "中国男篮再负韩国 世预赛两连败", "中国游客骤减 日本多地旅游业遭冲击", "台湾网红钟明轩打卡重庆", "以总统回应内塔尼亚胡赦免请求", "高志凯建议不再用冲绳称呼琉球群岛", "顾客买鞋子仅退款拿AI视频当凭证", "特朗普对马杜罗下最后通牒", "哥哥来泡茶称与爷爷不泡茶无关联", "正直播NBA：黄蜂vs篮网", "德国总理：不能给乌克兰“强加和平”", "33岁驻村干部病逝：孩子还不到一岁", "民警拦截百万涉案资金后喜极而泣", "王励勤担任体育总局乒羽中心副主任", "北约扬言考虑对俄“先发制人”", "流感新药扎堆上市", "文眉师故意文丑眉强迫顾客升单获刑", "宁德时代基层员工每月涨薪150元", "河南一景区大力度禁烟引好评", "中国科学家全面模拟火星沙尘循环", "DeepSeek同时发布两个正式版模型", "泽连斯基与马克龙会谈 聚焦和平谈判"]

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
