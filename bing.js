// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.132
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
var default_search_words = ["习近平深情讲述的抗战英雄故事", "全班45人43人超600分", "中央气象台发布暴雨高温双预警", "我在达沃斯认识了这些黑科技朋友", "35岁再考清华男子高考分数超640", "高校通报“男扮女装替考”：拟开除", "日本首次在本土试射“远程导弹”", "成绩被屏蔽女孩坚信不存在智商差距", "老头乐成为县城小伙的精神迈巴赫", "狗狗被困洪水不要救援 只等主人来接", "伊朗防长现身青岛", "女孩被120强制带走后死亡？不实", "女生高考724分爸爸激动到尖叫", "特朗普称被北约秘书长叫“爸爸”", "特朗普将空袭伊朗比作广岛长崎核爆", "吴奇隆刘诗诗合体带娃 力破婚变传闻", "特朗普：以伊冲突可能会再次爆发", "越南女首富张美兰死刑罪名将改判", "中方回应特朗普要中国买美国石油", "千年武则天无字碑“加盖” 官方回应", "高三老师再战高考637分请全班吃饭", "错换人生28年养母起诉姚策亲生父母", "首尔地铁纵火嫌疑人对离婚判决不满", "女子带狗自驾新疆 狗狗半路意外怀孕", "伊朗称核设施在美国空袭中严重受损", "弗拉格被独行侠选中当选状元秀", "女生中考520分高考666分幸运值拉满", "美航母福特号启程", "特朗普会见泽连斯基", "美中央情报局称伊关键核设施被摧毁", "父女一同高考 女儿猛超爸爸200多分", "美国一载159人客机发动机起火", "美伊谈判将重启 伊证实核设施遭破坏", "伊朗核设施是否被摧毁", "酷似林依晨的曼联女孩高考出分", "特朗普：将选出下任美联储主席", "温网种子选手名单公布", "老人逆行碰瓷 男子拿行车记录揭穿", "“救助百名弃婴的和尚”涉嫌诈骗", "广西柳江出现84.19米洪峰水位", "1米98帅小伙个高分也高 冲西南大学", "美官员称美将在美墨边境设新军事区", "714分考生妈妈查分前梦到考了714分", "300秒见证以伊十二日战争", "黄子韬工作室发声明否认代孕", "U21欧青赛英格兰2-1绝杀荷兰", "王曦雨近4年首次无缘温网正赛", "梁实第29次高考差本科线13分", "中国最大海上气田建成", "以部队冲突期间深入伊境内开展行动", "《桃花映江山》孟子义姜桃花狐系美人"]

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
