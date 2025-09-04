// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.273
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
var default_search_words = ["领航强军 从胜利走向胜利", "习近平同金正恩会谈", "受阅战车里为什么有一双崭新皮鞋", "震撼长卷！九三大阅兵全程再现", "网友说像“洗衣机”的武器到底是啥", "执勤军人纹丝不动 阿姨不停给其扇风", "中国网警：烽火烬处 赓续前行", "九三阅兵现场出现一位“特别观众”", "中方驳斥特朗普涉中俄朝三国言论", "战机拉出14道彩烟象征14年抗战", "九三阅兵8万只气球最后都去哪了", "校方辟谣“54岁阿姨上岸硕士”", "两学生撑伞反把校长淋透 浙工大回应", "北京杜莎夫人蜡像馆将永久关停", "东风-41车贴刚到半天就成老款了", "华为新款三折叠手机起售价17999元", "和平鸽每只有15元“工资”", "鸠山由纪夫：怀着反省谢罪心情赴华", "国台办痛批赖清德对阅兵说三道四", "阅兵时敬礼的老兵曾在开国大典站岗", "普京乘机回国 王毅送行", "九三文艺晚会总导演原来是她俩", "装备方队唯一“女教头”超帅", "官方回应102岁老兵看完阅兵后去世", "受阅部队退场名场面：宛如一条巨龙", "“呼叫81192！” 这一刻含泪量太高", "阅兵的“机器狼”与机器狗有啥区别", "美防长谈九三阅兵：不寻求和中国冲突", "新华社认证的帅兵哥已婚", "华为新款三折叠手机上手体验", "宝宝出生恰逢阅兵 家人取名袁安阅", "医生：真正伤眼的“隐形杀手”是糖", "王毅送中国跑鞋 匈牙利外长爱不释手", "严重违纪违法 李文荣被“双开”", "兵马俑一号坑为啥有个大洞", "唐湘龙评阅兵新装备", "多国领导人称赞九三阅兵：非凡盛会", "台媒称台军难以望到解放军尾灯", "3架阅兵备份机临近天安门时返航", "外交部回应普京结束访华", "老人将电视正对烈士墓碑播阅兵", "工人大叔坐工地看阅兵默默擦泪", "美食博主探店3年确诊糖尿病", "LY-1：激光防空武器“更胜一筹”", "特朗普下令重振美国军队", "意大利小城餐厅转播九三阅兵", "“麒麟芯片”再度现身华为发布会", "刘劲唐国强共同观礼九三阅兵", "武契奇：塞尔维亚永远不忘中国支持", "在抵达天安门前返航 他们一样光荣", "小伙豪饮火锅汤后痛风发作无法行走"]

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
