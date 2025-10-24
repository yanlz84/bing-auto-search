// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.372
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
var default_search_words = ["二十届四中全会公报发布", "中小学春秋假来了 各地怎么放", "缅甸军方突袭KK园区", "十五五时期经济社会发展主要目标", "力挺两岸统一的台退役中将遭重判", "野生动物园月薪5万招聘猛兽区司机", "韩国女子赴柬应聘翻译被同胞卖掉", "德军方举行演习遭当地警方实弹还击", "普京：若“战斧”袭击俄将会强硬回应", "“十四五”亮点：教书育人", "安世中国郑重声明", "上海、成都辟谣“取消中考”", "谷爱凌一袭长裙骑马出场", "男子多次用指纹解开邻居智能门锁", "“特朗普取消会晤” 普京发声", "军报：坚定捍卫人民军队政治本色", "京东公布新车性能配置", "金店老板10元1克收孩子黄金还给家长", "韩国庆州出土1600年前将军墓", "中国高铁跑出453公里时速引韩国热议", "8888元/桌婚宴被指预制菜 酒店否认", "摩根大通：金价未来三年内可能会翻倍", "充电后占位94分钟被收438元 法院判了", "贵州“无绳蹦极”被叫停", "高校研究所卖柑桔 7天卖出25000斤", "巨头公司董事长和6名董事集体辞职", "造谣“中国人吃乌鸦” 日媒被处理", "南北分界线具象化了", "新疆20多人骑骆驼去洛阳 已走60多天", "南部战区等联合发布硬核宣传片", "正直播NBA：雷霆vs步行者", "中国万吨级纯电动散货船下水", "胡歌陈龙现身青海", "男子非法采挖7株野生兰花 被判缓刑", "中央军委副主席张升民简历发布", "俄运动员无法参加2026年冬残奥会", "美政府“停摆”致食品券面临停发", "兰博基尼为什么不去车展了", "日本福岛地震 核电站附近震感明显", "美股收盘：百度涨近3%", "通信技术试验卫星二十号发射成功", "美国轰炸机曾靠近委内瑞拉海岸", "香山红叶延缓变色", "英吉利海峡偷渡抵英人数创历史第2高", "立陶宛称俄战机侵犯领空 俄方否认", "俄外交部：俄罗斯已对西方制裁免疫", "以外长：不会与联合国近东救济处合作", "年轻人淘布料做衣服 价格便宜一半", "白宫：特朗普普京会晤并非完全不可能", "美国务卿与以总理会面", "委防长：美中情局破坏企图都将失败"]

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
