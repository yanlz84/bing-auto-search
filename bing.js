// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.338
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
var default_search_words = ["跟着总书记一起厚植文化底蕴", "央视秋晚7大神级现场", "亲历珠峰暴雪游客：全身结冰 很恐怖", "60秒延时摄影赏中秋月", "五粮液有岗位招聘要求体测3000米", "店家回应炒蛏子和螃蟹两个菜661元", "全世界都知道中国人放假了", "游客在内蒙古排队捡土豆 当地回应", "谢娜首次主持央视秋晚", "南昌“扇子哥”：不追究任何人责任", "62岁TVB演员江华现身景区“再就业”", "男子别车谎称公安 警方通报", "高铁上男子亲陌生小女孩称太可爱", "交警大队中队长执法现场被撞牺牲", "武汉现超大月饼重388斤 500人排队吃", "景区回应游客捡板栗壳被说成偷东西", "闫妮央视秋晚没有微醺", "云南通报：朱滔伪造证据对抗组织审查", "千万网友催更 杭州公安霸总短剧火了", "2025年诺贝尔生理学或医学奖揭晓", "热门中概股多数上涨 百度涨超2%", "泰国发生黄金大劫案 视频曝光", "周深秋晚压轴 中俄双语唱《归来》", "“超级月亮”和古建筑浪漫同框", "你牵挂了17年的他们都在好好生活", "新决定来了 詹姆斯重磅预告引热议", "00后女老师教非遗变脸一席难求", "哈马斯：与以间接谈判取得积极进展", "华科大73对新人集体成婚", "环保少女被以色列驱逐后发表讲话", "中秋晚会没有何炅", "刚死不久的螃蟹能吃吗", "月收入2万“金牌挑蟹师”如何选螃蟹", "如何买到返程票？官方支招", "他们找到了免疫系统的“安全卫士”", "受损的兵马俑国庆长假还在“病休”", "男子假期带3岁孙子推100岁爷爷遛弯", "陈丽君在《人民日报》撰文", "郑丽文回应被张亚中批评：感谢指正", "法国总理解释“闪辞”原因", "诺奖新得主为自身免疫性疾病带来希望", "关键时刻 普京与内塔尼亚胡通话", "“北上渝”成国庆假期三大“顶流”", "前山东男篮主教练徐长锁离世", "美政府关门致经济每周损失150亿美元", "被困珠峰游客称暴雪闪电中挺过一晚", "孙子误吃过期月饼 奶奶掏出过期药", "双胞胎萌娃拉爸爸给执勤武警送糖果", "天门山缆车悬停空中1小时？景区致歉", "美战争部长已累计解雇6名高级将领", "特朗普将对进口中重型卡车收25%关税"]

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
