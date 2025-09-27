// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.318
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
var default_search_words = ["为新疆更美好的明天共同奋斗", "甘肃陇西发生5.6级地震", "中方回应巴勒斯坦申请加入金砖国家", "中国专业技术人才超过8000万人", "景德镇城管已为鸡排哥成立工作专班", "以色列总理联大演讲时多国代表离场", "甘肃定西40分钟连震4次", "事关1670多万学生 六部门重磅发文", "巴勒斯坦女孩废墟中被救出全身颤抖", "山东“豆橛子”月饼什么味", "甘肃陇西凌晨地震 网友拍下碎石遍地", "广东两所学校因台风坍塌系谣言", "微信又上新功能", "中俄巴伊四国发表《联合声明》", "高校快递站2人殴打1名教师", "甘肃陇西5.6级地震监控猛晃超20秒", "中方驳斥波兰外长指责", "陕西农民犁地时挖出国宝", "“国民廉价鱼”带鱼原来一直被低估", "中方回应泰国新任总理涉华表态", "苏炳添赛后公开表示自己还没退役", "日本女市长多次与男下属进酒店", "两人过机场安检10分钟狂炫7斤多榴莲", "以总理遭离场抗议 伊朗席位留一照片", "台风“博罗依”来袭 最新路径公布", "好利来回应月饼27元一块", "“越狱”雪豹“闹闹”已被找到", "舒淇获釜山电影节最佳导演", "天津大量螃蟹爬上马路 有人捡十斤", "理想总裁发布会直播睡觉", "21岁中国女孩独自赴埃及旅游失联", "全国军迷羡慕的工位 到底是干啥的", "孕妇遭遇黑熊袭击装死逃过一劫", "大爷无证驾驶一年多内违章279条", "蔡磊回应丧失语言能力：不会屈辱等死", "以色列威胁加沙援助船队：后果自负", "证券从业者违规买卖股票 被罚1.59亿", "赵立坚点赞湖北文旅花式整活", "甘肃陇西地震暂未收到人员伤亡", "曝iPhone17国内首周激活量破百万", "以称哈马斯若同意条件冲突立刻结束", "王水平严重违纪违法被“双开”", "欧盟拟启动“无人机墙”防御系统", "以色列一男子因威胁枪杀以总理被捕", "特朗普提交加沙战后新方案", "“桦加沙”刚走 “博罗依”又来了", "驻马来西亚使馆提醒公民注意安全", "男孩雨天迷路 男子驱车十公里送回", "11万本“伤眼”作业本被召回", "以军袭击加沙多地 空袭超百个目标", "厂长要完爆iG的BP"]

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
