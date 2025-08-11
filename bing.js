// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.224
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
var default_search_words = ["总书记的人民情怀", "没结婚证不能领育儿补贴？官方回应", "DeepSeek母公司员工套取上亿元被抓", "气象专家分析8月下旬天气形势", "张本智和取关早田希娜", "全球首个孕育机器人预计一年内面世", "净网：编造地震虚假灾情？网警查处", "“九三阅兵”首次演练画面公布", "月薪2万吃不起百果园", "中国第三种六代机亮相 美媒都蒙了", "男子嫌太吵向楼下烧烤店泼不明液体", "取款超5万要说明用途？三部门发文", "新郎起诉称新娘“不让碰” 法院判了", "新央企董事长登门拜访任正非", "“国民果汁”疑被空手套白狼", "韩国遇上大麻烦 兵力已锐减20%", "长大后理解妈妈为何喜欢给自己拍照", "牛弹琴：特朗普实在看不下去了", "警方介入男子往烧烤摊泼不明液体", "央视曝光假农业达人表演式带货圈钱", "美韩将举行联合军演 朝鲜：强烈谴责", "三地冲刺万亿城市 其中一个更特殊", "司机高速违法被举报：我没时间处理", "北方“桑拿天”即将返场", "路人摘葵花后在枝头留钱 农户感动", "为啥有的列车坐着坐着车次就变了", "沈阳一河流现大量泡沫 官方已立案", "女子试穿4条裤子留下血渍赔50元", "三大央媒关注“假院士阮少平”", "董事长：教消费者成熟 百果园：有误解", "偶遇马筱梅带大S子女机场出行", "以军炸死5名半岛电视台记者现场曝光", "58岁歌手“光头李进”当爸", "实探风波中的百果园：价格普遍偏高", "半岛电视台记者遭以军袭击 5人死亡", "中国代表就巴以问题连说3个不可接受", "以军炸死记者 众人怒吼将遗体抬出", "中方就巴以问题提出“4个必须”", "那英去《花少》带了更年期的药", "国乒包揽横滨冠军赛女单四强", "土耳其地震已致1死29伤", "“杨柳”将在台湾东部沿海登陆", "世运会开幕式“点火女孩”徐露摘金", "王楚钦今日迎战莫雷加德冲击冠军", "张本智和回应“告状”：希望多些尊重", "胖东来上级对下属发脾气将被罚款", "苍山循环播放走失男童母亲呼唤声", "北京新政“首秀”周末：二手房成交忙", "美国说唱歌手在家中遭枪击身亡", "美以领导人讨论“接管加沙城计划”", "中国队晋级U20女足亚洲杯决赛圈"]

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
