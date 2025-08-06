// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.214
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
var default_search_words = ["汇聚人民智慧 共绘发展蓝图", "以色列总理决定全面占领加沙", "“鬼火少年”夜闯医院走廊 当地回应", "关于下半年经济工作 多部门发声", "房主任哽咽呼吁大家不要买黄牛票", "14岁中国交换生被刺死 13岁女生被拘", "3岁宝宝确认先天体操圣体", "老人误将干燥剂当药喂给4月龄宝宝", "赵露思1分钟视频报价53万", "河南旱情玉米叶子卷得像油条", "胡歌出镜确认是真的袁弘", "眼科专家破解青少年用眼八大流言", "奇瑞董事长就加班问题反思致歉", "图书馆回应少儿阅读区情侣搂抱亲热", "暴跌99% 印度吸金的故事讲不下去了", "中国男篮93比88险胜东道主沙特", "英国女子称在空中遭滑翔伞教练性侵", "89岁“康熙”扮演者焦晃近况曝光", "放弃DeepSeek的用户都跑哪去了", "抽象AI短剧火了 50块做3集月入50万", "贾冰暴瘦后面相被说吓人", "河南遭遇近25年以来最严重旱情", "浙大青年博导在校园坠亡？校方回应", "暴雨致街道被淹 眼镜蛇缠在窗户上", "KTV用AI生成的MV惊现骷髅", "特朗普“生吞”冯德莱恩", "特斯拉赛博皮卡能上牌了？车商回应", "消费者曝光知名零食品牌鸭爪发霉", "加沙儿童严重脱水 哭时没有一滴眼泪", "女子扶老人被诬陷 维权2月获道歉信", "印度女主播强硬回怼特朗普", "三高老人被女婿爆改成腹肌大爷", "司机中毒失去意识前拼命向警车开去", "研究生卖烧饼走红否认学历浪费", "特朗普加码向印度“开火”", "国家电网用电负荷连续两天创新高", "许家印香港豪宅被曝违建5000尺", "特朗普：可能很快宣布美联储新任主席", "山东爷爷12年如一日将孙女背进大学", "英伟达：我们的芯片不存监控软件", "福耀科技大学8年可拿博士学位", "贵州千户苗寨景区观光车失控撞路边", "4岁萌娃被锁家中机智报警“求救”", "丹麦一动物园呼吁捐宠物喂肉食动物", "英伟达新规引争议", "俄堪察加半岛火山喷发 岩浆数百米", "美卫星照片显示俄核潜艇基地受损", "OpenAI发布2款开源模型", "美国将正式取消马斯克“周报”计划", "6名游客被人头蜂追着咬 路人相救", "李想回应i8统一配置版本"]

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
