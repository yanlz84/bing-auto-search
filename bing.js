// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.303
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
var default_search_words = ["人类和平与发展的崇高事业必将胜利", "习近平同美国总统特朗普通电话", "江苏一地发现金矿", "想当飞行员到底有多难", "外卖常见的小碗蒸蛋也可能是预制", "马克龙夫人提交证据证明自己是女性", "公安部公布10起网络违法犯罪案例", "香港半亿黄金盗窃案37岁主谋落网", "埃及3000年前法老金镯被卖不到3万", "地方反映教师不愿当班主任", "全红婵读大学后要退役？知情人发声", "景区辟谣陕西太白山下大雪", "女高管被老板强奸 老公：支持爱人", "山姆门店回应卖冷冻2年的西兰花", "老人疑长期摆摊卖“假水” 当地回应", "又旧又没人 火车票代售点该淘汰吗", "女主播赴约打榜大哥遭性侵 法院判了", "韩国93岁娃娃脸女校长引热议", "镇政府回应男子“崖下洞居”5年", "百岁老人偷玩曾孙玩具 儿子悄悄记录", "24岁男演员兼职送外卖", "701万彩票大奖近50天无人领", "抢婴案主犯不服 当庭骂法官骂同伙", "“白帝”战机亮相长春航展", "抢婴案律师：从未见过如此嚣张的被告", "iPhone17发售现场秒变交易市场", "特朗普拒绝批准4亿美元对台军售", "创始人赵晗去世 云海肴CEO发文悼念", "驴友秦岭失联遇难 家属起诉救援队", "“海底捞们”集体做一人食外卖", "云海肴赵晗遗体告别仪式明天举行", "俄外长：俄方愿意有条件妥协", "特朗普称普京让他失望", "76岁他信被曝狱中脱发睡不好", "男子为确认暗恋女子单身擅闯其住宅", "台风“米娜”在广东汕尾登陆", "王俊凯联合清华大学设立奖学金", "长春航展集中展出百余型现役飞机", "云海肴创始人赵晗去世 年仅40岁", "蒋雯丽怒告造谣博主获赔12.5万", "《琅琊榜》开播十周年 胡歌献声", "冷冻2年的西兰花山姆也在卖", "法国动员8万警察与宪兵应对抗议罢工", "起底翟欣欣：两次闪婚闪离", "35岁男子欠债35万回乡“崖下洞居”", "翟欣欣获刑12年 曾索要千万逼死前夫", "香港一工地疑发现战时炸弹", "泰军方决定继续关闭泰柬边境口岸", "8岁男孩被银环蛇咬伤昏迷送ICU", "贵州一县委书记李景宽任上被查", "山东入室抢婴案宣判：1人死缓2人无期"]

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
