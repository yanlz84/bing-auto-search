// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.371
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
var default_search_words = ["擘画新蓝图", "二十届四中全会公报发布", "四中全会公报：推进祖国统一大业", "“十四五” 改变你我生活", "四川发现新物种：华西颈斑蛇", "贵州“无绳蹦极”被叫停", "净网：无人机“职业刷机人”涉嫌犯罪", "四中全会审议通过“十五五”规划建议", "金店老板10元1克收孩子黄金还给家长", "今日霜降 安全风险提示请收好", "四中全会公报这些表述值得关注", "上海、成都辟谣“取消中考”", "中央军委副主席张升民简历发布", "四中全会公报：推动房地产高质量发展", "法国前总统萨科齐入狱后遭囚犯霸凌", "十五五时期经济社会发展主要目标", "突破瓶颈！中国成功研制新型芯片", "这种“带娃神器”别再用了", "2座准万亿城市部署“冲万亿”", "何超莲窦骁回应传闻：我们感情稳定", "安徽最强性价比公交：116公里仅收1元", "看一场“橘子味”的烟花", "南北分界线具象化了", "“为人民服务”航标被破坏 当地通报", "宇树机器人韩国热舞 穿衬衫跳K-POP", "中方回应欧盟制裁12家中国公司", "孙燕姿恩师突发脑出血 已完成手术", "乌克兰一幼儿园遭袭瞬间画面曝光", "中方回应高市早苗称将提高防卫开支", "中美经贸磋商将于10月24至27日举行", "贝克汉姆发视频分享田园生活", "欧洲急求和中国“沟通”", "知名健身博主周六野官宣产女", "年轻人淘布料做衣服 价格便宜一半", "蔡国强在巴黎再办烟花秀", "中方坚决反对美国对古巴封锁制裁", "警方回应击毙黑熊为何不用麻醉枪", "主人称马被箭射死：怀疑是无人机投射", "高速上他挥舞手电拼命拦车", "A股收评：三大指数全线收红", "男子非法采挖7株野生兰花 被判缓刑", "超过60岁不能办eSIM？中国电信回应", "SpaceX称切断电诈园周边2500台星链", "韩国梨泰院踩踏事件调查结果出炉", "陆一鸣任波音中国总裁 柳青退休", "“十五五”时期发展遵循6个坚持", "萨科齐服刑监狱曾被批老鼠滋生", "野生动物园月薪5万招聘猛兽区司机", "图书馆治理占座：超30分钟自动弃座", "杨瀚森首秀2分1板 开拓者惜败森林狼", "“十五五”具有承前启后重要地位"]

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
