// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.280
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
var default_search_words = ["总书记的人民情怀", "“红月亮”高清大图来了", "男子忘关火外出27天回家才发现", "@2026届毕业生 你有求职补贴待领取", "湖南一地编制精简16.6%", "特朗普：准备对俄实施第二阶段制裁", "净网：女子摆拍嫁到国外贫民窟被罚", "向太曝张国荣不是因抑郁症自杀", "多地停航、停运、停课、关闭景区", "牛弹琴：这是韩国的奇耻大辱", "主人住院 狗狗叼来雨布遮盖芝麻", "央视曝光手边的“毒”玩具", "直击月亮“变脸”全过程", "俄罗斯发动大规模袭击", "考科目二把考场围墙撞塌了", "泰国新总理夫人火了 原为网红店老板", "今日深圳全天停课", "警方通报“女子遭前夫殴打致死”", "LABUBU二手价格大跌", "9秒速览月全食精华画面", "大学博导被批捕 系上市公司实控人", "辛芷蕾拿影后 VOGUE主编评论区沦陷", "微软：红海海底光缆“被切断”", "司机称备胎被偷 网友留言令人感动", "高校回应宿舍床直接钉在墙上", "特朗普否认计划向芝加哥宣战", "小米回应交付“测试车”给用户", "多个视频平台被曝“偷时间”", "5旬保安深夜救落水女生 物业回应", "重庆10天官宣6名厅官落马", "特朗普向哈马斯发出“最后警告”", "年薪50万女生留村创业", "沈阳通报沈师大学生呕吐腹泻事件", "美国打美国？华盛顿芝加哥都怒了", "致16死的里斯本缆车脱轨原因披露", "长沙会战碑下有人放了九三阅兵照片", "深圳一女子地铁打安检员被行拘", "美国开出近18亿美元彩票头奖", "中小学生午休躺睡全面普及还远吗", "香港演员罗莽失联？知情人：手机坏了", "特朗普回应石破茂辞职：完全不知道", "阿尔卡拉斯夺美网男单冠军", "IG3-0击败EDG", "中央气象台9月8日发布台风黄色预警", "党主席改选 国民党没本钱内耗", "乌政府大楼遇袭 俄称未进行袭击", "日本或再陷“一年一首相”政局", "AG夏季赛冠军", "胡塞武装称袭击以色列多个目标", "U16男篮亚洲杯中国队亚军收官", "台风“塔巴”来袭 广东多地停课"]

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
